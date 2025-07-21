local CharacterList = {}
local cam = nil

local function toggleNuiFrame(shouldShow)
    SetNuiFocus(shouldShow, shouldShow)
    SendReactMessage('setVisible', shouldShow)

    if not shouldShow then
        if cam then
            RenderScriptCams(false, false, 0, true, true)
            DestroyCam(cam, false)
            cam = nil
        end
        for _, entry in pairs(CharacterList) do
            if entry.ped and DoesEntityExist(entry.ped) then DeletePed(entry.ped) end
            if entry.veh and DoesEntityExist(entry.veh) then DeleteVehicle(entry.veh) end
        end
        CharacterList = {}
    end
end

RegisterNUICallback("flakeyCore:createCharacter", function(data, cb)
    TriggerServerEvent("flakeyCore:createCharacter", data)
    cb({ status = "ok" })
end)

RegisterNUICallback("flakey_multichar:selectCharacter", function(data, cb)
    local cid = data.cid
    if cid then
        toggleNuiFrame(false)
        TriggerServerEvent("flakeyCore:selectCharacter", cid)
        TriggerEvent("flakey_spawnselector:openSpawnSelector", data.position)
        cb({ status = "ok" })
    else
        cb({ status = "error", message = "Invalid CID selected" })
    end
end)

RegisterNUICallback("flakey_multichar:deleteCharacter", function(data, cb)
    local cid = data.cid
    if cid then
        TriggerServerEvent("flakeyCore:deleteCharacter", cid)
        cb({ status = "ok" })
    else
        cb({ status = "error", message = "Invalid CID" })
    end
end)

RegisterNetEvent("flakey_multichar:characterDeleted", function(cid)
    SendReactMessage("characterDeleted", cid)

    local entry = CharacterList[cid]
    if entry then
        if entry.ped and DoesEntityExist(entry.ped) then DeletePed(entry.ped) end
        if entry.veh and DoesEntityExist(entry.veh) then DeleteVehicle(entry.veh) end
        CharacterList[cid] = nil

        if cam then
            local firstCid = next(CharacterList)
            if firstCid and CharacterList[firstCid] and CharacterList[firstCid].ped then
                local ped = CharacterList[firstCid].ped
                SetCamCoord(cam, GetOffsetFromEntityInWorldCoords(ped, 0.0, 2.0, 1.0))
                PointCamAtEntity(cam, ped)
            else
                RenderScriptCams(false, false, 0, true, true)
                DestroyCam(cam, false)
                cam = nil
            end
        end
    end
end)

RegisterNetEvent("flakey_multichar:characterCreated", function(success, cid)
    if success then
        TriggerServerEvent("flakeyCore:selectCharacter", cid)
        toggleNuiFrame(false)
    else
        print("Failed to create character")
    end
end)

RegisterNetEvent("flakey_multichar:showCreateCharacter", function()
    toggleNuiFrame(true)
    SendReactMessage("showCreateCharacter")
end)

RegisterNetEvent("flakey_multichar:loadCharacters", function(characters)
    toggleNuiFrame(true)
    SendReactMessage("loadCharacters", characters)

    -- Clean up
    for _, entry in pairs(CharacterList) do
        if entry.ped and DoesEntityExist(entry.ped) then DeletePed(entry.ped) end
        if entry.veh and DoesEntityExist(entry.veh) then DeleteVehicle(entry.veh) end
    end
    CharacterList = {}

    local basePos = vector3(-1023.00, -1023.27, 4.04)
    local basePositions = {
        { veh = `seashark3`, coords = vector3(-2080.29, -900.60, 0.03) },
        { veh = `cruiser`, coords = vector3(-1423.00, -1223.27, 4.04) },
        { veh = `blazer`, coords = vector3(2515.70, 3602.36, 93.04) },
        { veh = `manchez2`, coords = vector3(-191.86, 1539.42, 315.68) },
        { veh = `suntrap`, coords = vector3(1202.58, 3901.34, 29.10) }
    }

    local heading = 0.0

    local playerPed = PlayerPedId()
    SetEntityCoords(playerPed, basePos)
    SetEntityVisible(playerPed, false)
    SetEntityInvincible(playerPed, true)
    FreezeEntityPosition(playerPed, true)

    local shuffledPositions = {}
    for i = 1, #basePositions do table.insert(shuffledPositions, basePositions[i]) end
    for i = #shuffledPositions, 2, -1 do
        local j = math.random(1, i)
        shuffledPositions[i], shuffledPositions[j] = shuffledPositions[j], shuffledPositions[i]
    end
    
    for i, char in ipairs(characters) do
        local positionData = shuffledPositions[i] or shuffledPositions[1]
        local vehModel = positionData.veh
        local spawnCoords = positionData.coords

        local pedData = json.decode(char.ped)
        local model = tonumber(pedData.model)

        RequestModel(model)
        while not HasModelLoaded(model) do Wait(0) end

        RequestModel(vehModel)
        while not HasModelLoaded(vehModel) do Wait(0) end

        local veh = CreateVehicle(vehModel, spawnCoords.x, spawnCoords.y, spawnCoords.z, heading, false, true)
        SetEntityInvincible(veh, true)
        SetEntityAsMissionEntity(veh, true, true)

        local ped = CreatePedInsideVehicle(veh, 4, model, -1, false, true)

        for _, comp in ipairs(pedData.components or {}) do
            SetPedComponentVariation(ped, comp.component_id, comp.drawable_id, comp.texture_id, 0)
        end
        for _, prop in ipairs(pedData.props or {}) do
            SetPedPropIndex(ped, prop.prop_id, prop.drawable_id, prop.texture_id, true)
        end

        SetBlockingOfNonTemporaryEvents(ped, true)
        SetPedFleeAttributes(ped, 0, false)
        SetPedCombatAttributes(ped, 17, true)
        SetDriverAbility(ped, 1.0)
        SetDriverAggressiveness(ped, 0.0)
        SetPedKeepTask(ped, true)

        TaskVehicleDriveWander(ped, veh, 10.0, 786468)

        CharacterList[char.cid] = { ped = ped, veh = veh }
    end

    -- Top-down cam when characters first load
    if not cam then
        cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)

        local camFocus = basePos
        local camHeight = 200.0
        SetCamCoord(cam, camFocus.x, camFocus.y, camFocus.z + camHeight)
        PointCamAtCoord(cam, camFocus.x, camFocus.y, camFocus.z)
        SetCamRot(cam, -90.0, 0.0, 0.0)

        SetCamActive(cam, true)
        RenderScriptCams(true, false, 0, true, true)
    end
end)

RegisterNUICallback("flakey_multichar:focusCharacter", function(data, cb)
    local cid = data.cid
    local entry = CharacterList[cid]
    local playerPed = PlayerPedId()
    if entry and entry.ped and entry.veh then
        if not cam then
            cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
            SetCamActive(cam, true)
            RenderScriptCams(true, false, 0, true, true)
        end

        CreateThread(function()
            while cam and DoesEntityExist(entry.ped) and DoesEntityExist(entry.veh) do
                local camOffset = GetOffsetFromEntityInWorldCoords(entry.veh, 0.0, 4.0, 2.5)
                SetCamCoord(cam, camOffset.x, camOffset.y, camOffset.z)
                PointCamAtEntity(cam, entry.ped)
                SetEntityCoords(playerPed, vector3(camOffset.x, camOffset.y, camOffset.z))
                Wait(0)
            end
        end)
    end

    cb({ status = "ok" })
end)

RegisterCommand("coords", function()
    local coords = GetEntityCoords(PlayerPedId())
    print(("Current coordinates: x=%.2f, y=%.2f, z=%.2f"):format(coords.x, coords.y, coords.z))
end, false)
