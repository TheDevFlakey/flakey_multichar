local function toggleNuiFrame(shouldShow)
  SetNuiFocus(shouldShow, shouldShow)
  SendReactMessage('setVisible', shouldShow)
end

RegisterNUICallback("flakeyCore:createCharacter", function(data, cb)
    TriggerServerEvent("flakeyCore:createCharacter", data)
    cb({ status = "ok" })
end)

RegisterNUICallback("flakey_multichar:selectCharacter", function(data, cb)
    local slot = data.slot
    if slot then
        TriggerServerEvent("flakeyCore:selectCharacter", slot)
        TriggerEvent("flakey_spawnselector:openSpawnSelector")
        toggleNuiFrame(false)
        cb({ status = "ok" })
    else
        cb({ status = "error", message = "Invalid slot selected" })
    end
end)

RegisterNUICallback("flakey_multichar:deleteCharacter", function(data, cb)
    local slotId = data.slotId
    if slotId then
        TriggerServerEvent("flakeyCore:deleteCharacter", slotId)
        cb({ status = "ok" })
    else
        cb({ status = "error", message = "Invalid slot ID" })
    end
end)

RegisterNetEvent("flakey_multichar:characterDeleted", function(slotId)
    print(slotId)
        print("Character deleted successfully from slot: " .. slotId)
        SendNUIMessage({
            action = "characterDeleted",
            slotId = slotId
        })
end)

RegisterNetEvent("flakey_multichar:characterCreated", function(success, slotId)
    if success then
        print("Character created successfully in slot: " .. slotId)
        TriggerServerEvent("flakeyCore:selectCharacter", slotId)
        toggleNuiFrame(false)
    else
        print("Failed to create character")
    end
end)

RegisterNetEvent("flakey_multichar:showCreateCharacter", function()
    toggleNuiFrame(true)
    SendNUIMessage({
        action = "showCreateCharacter"
    })
end)

RegisterNetEvent("flakey_multichar:loadCharacters", function(characters)
    toggleNuiFrame(true)
    SendNUIMessage({
        action = "loadCharacters",
        data = characters
    })
end)