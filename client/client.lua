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
        for _, ped in pairs(CharacterList) do
            if DoesEntityExist(ped) then DeletePed(ped) end
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
        TriggerEvent("flakey_spawnselector:openSpawnSelector")
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
    if CharacterList[cid] and DoesEntityExist(CharacterList[cid]) then
        DeletePed(CharacterList[cid])
        CharacterList[cid] = nil
        if cam then
            local firstCid = next(CharacterList)
            if firstCid and CharacterList[firstCid] then
                local ped = CharacterList[firstCid]
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

    -- Clean up old peds
    for _, ped in pairs(CharacterList) do
        if DoesEntityExist(ped) then DeletePed(ped) end
    end

    CharacterList = {}

    -- Change this to wherever you want them to stand (e.g., your interior)
    local basePos = vector3(215.76, -810.12, 30.73)
    local playerPed = PlayerPedId()
    local heading = 160.0
    local spacing = 2

    SetEntityCoords(playerPed, basePos.x, basePos.y, basePos.z)
    SetEntityVisible(playerPed, false)
    SetEntityInvincible(playerPed, true)
    FreezeEntityPosition(playerPed, true)

    local idleAnims = {
        { dict = "amb@world_human_stand_mobile@male@text@idle_a", anim = "idle_a" },
        { dict = "amb@world_human_stand_mobile@female@text@idle_a", anim = "idle_a" },
    }

    -- Load anim dicts once to avoid repeated loading
    for _, anim in ipairs(idleAnims) do
        RequestAnimDict(anim.dict)
        while not HasAnimDictLoaded(anim.dict) do Wait(0) end
    end

    for i, char in ipairs(characters) do
        local pedData = json.decode(char.ped)
        local model = tonumber(pedData.model)

        RequestModel(model)
        while not HasModelLoaded(model) do Wait(0) end

        local offsetX = (i - 1) * spacing
        local pos = basePos + vector3(offsetX, 0.0, 0.0)
        local ped = CreatePed(4, model, pos.x, pos.y, pos.z, heading, false, true)

        local anim = idleAnims[(i % #idleAnims) + 1]
        TaskPlayAnim(ped, anim.dict, anim.anim, 8.0, -8.0, -1, 1, 0, false, false, false)

        SetEntityInvincible(ped, true)
        FreezeEntityPosition(ped, true)
        SetBlockingOfNonTemporaryEvents(ped, true)

        for _, comp in ipairs(pedData.components or {}) do
            SetPedComponentVariation(ped, comp.component_id, comp.drawable_id, comp.texture_id, 0)
        end
        for _, prop in ipairs(pedData.props or {}) do
            SetPedPropIndex(ped, prop.prop_id, prop.drawable_id, prop.texture_id, true)
        end

        CharacterList[char.cid] = ped
    end

    -- Camera focus on first character
    local firstCid = characters[1] and characters[1].cid
    if firstCid and CharacterList[firstCid] then
        local ped = CharacterList[firstCid]
        if not cam then
            cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
            SetCamActive(cam, true)
            RenderScriptCams(true, false, 0, true, true)
        end

        local camOffset = GetOffsetFromEntityInWorldCoords(ped, 0.0, 2.0, 1.0)
        SetCamCoord(cam, camOffset.x, camOffset.y, camOffset.z)
        PointCamAtEntity(cam, ped)
    end
end)

RegisterNUICallback("flakey_multichar:focusCharacter", function(data, cb)
    local cid = data.cid
    local ped = CharacterList[cid]
    if ped and DoesEntityExist(ped) then
        local camCoords = GetOffsetFromEntityInWorldCoords(ped, 0.0, 2.0, 1.0)

        if not cam then
            cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
            SetCamActive(cam, true)
            RenderScriptCams(true, false, 0, true, true)
        end

        local fromPos = GetCamCoord(cam)
        local toPos = camCoords
        local duration = 500
        local startTime = GetGameTimer()

        CreateThread(function()
            while true do
                local now = GetGameTimer()
                local alpha = math.min(1.0, (now - startTime) / duration)
                local x = fromPos.x + (toPos.x - fromPos.x) * alpha
                local y = fromPos.y + (toPos.y - fromPos.y) * alpha
                local z = fromPos.z + (toPos.z - fromPos.z) * alpha
                SetCamCoord(cam, x, y, z)
                PointCamAtEntity(cam, ped)

                if alpha >= 1.0 then break end
                Wait(0)
            end
        end)
    end
    cb({ status = "ok" })
end)
