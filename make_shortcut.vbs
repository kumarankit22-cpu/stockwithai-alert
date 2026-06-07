Set WS = CreateObject("WScript.Shell")
exePath = "C:\Users\kumar\Desktop\StockwithAI\Alarm\ForexAlertApp_v3\ForexAlertApp_v5\ForexAlertApp\dist\StockwithAi Alert 1.0.0.exe"
iconPath = "C:\Users\kumar\Desktop\StockwithAI\Alarm\ForexAlertApp_v3\ForexAlertApp_v5\ForexAlertApp\icon.ico"
shortcutPath = WS.SpecialFolders("Desktop") & "\StockwithAi Alert.lnk"
Set SC = WS.CreateShortcut(shortcutPath)
SC.TargetPath = exePath
SC.WorkingDirectory = "C:\Users\kumar\Desktop\StockwithAI\Alarm\ForexAlertApp_v3\ForexAlertApp_v5\ForexAlertApp\dist"
SC.IconLocation = iconPath & ", 0"
SC.Description = "StockwithAi By Ankit Kumar - Forex & Index Price Alert"
SC.Save()
MsgBox "Shortcut bana diya! Desktop par dekho: StockwithAi Alert", 64, "Done"
