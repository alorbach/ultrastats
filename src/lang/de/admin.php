<?php
/*
	********************************************************************
	* Copyright by Andre Lorbach | 2006-2026						
	* -> https://alorbach.github.io/ultrastats <-											
	* ------------------------------------------------------------------
	*
	* Use this script at your own risk!									
	*
	* ------------------------------------------------------------------
	* ->	Admin language strings			in GERMAN
	*		Only needed in the Admin Center
	*																	
	* This file is part of UltraStats
	*
	* UltraStats is free software: you can redistribute it and/or modify
	* it under the terms of the GNU General Public License as published
	* by the Free Software Foundation, either version 3 of the License,
	* or (at your option) any later version.
	********************************************************************
*/

global $content;

// Global Stuff
$content['LN_ADMINADD'] = "Eintragen";
$content['LN_ADMINEDIT'] = "Editieren";
$content['LN_ADMINDELETE'] = "Lÿschen";
$content['LN_ADMINSEND'] = "Bestÿtigen";
$content['LN_MENU_ADMINSERVERS'] = "Server Admin";
$content['LN_MENU_ADMINPLAYERS'] = "Spieler Editor";
$content['LN_MENU_ADMINSTREDITOR'] = "String Editor";
$content['LN_MENU_ADMINUSERS'] = "User Admin";
$content['LN_MENU_ADMINLOGOFF'] = "Ausloggen";
$content['LN_ADMIN_MOREPAGES'] = "(Mehr als %1 Seiten gefunden)";
$content['LN_ADMIN_POPUPHELP'] = "Wozu ist dieser Button?";

// LoginPage
$content['LN_ADMINLOGIN'] = "Admin login";
$content['LN_USERNAME'] = "Benutzername";
$content['LN_PASSWORD'] = "Passwort";
$content['LN_SAVEASCOOKIE'] = "Eingeloggt bleiben (Gespeichert in Cookie)";
$content['LN_LOGIN_ERRORWRONGUSER'] = "Falscher Benutzername oder Passwort!";
$content['LN_LOGIN_ERRORUSERPASSNOTGIVEN'] = "Benutzername oder Passwort nicht vergeben!";

// Main Page
$content['LN_ADMINCENTER'] = "Administration";
$content['LN_NUMSERVERS'] = "Nummer des Servers";
$content['LN_LASTDBUPDATE'] = "Letztes Datenbank Update";
$content['LN_ADMINGENCONFIG'] = "Generelle Konfiguration";
$content['LN_CURRDBVERSION'] = "Interne Datenbank Version";

// Main Options
$content['LN_ADMINFRONTEND'] = "Haupt Einstellungen";
$content['LN_GEN_WEB_STYLE'] = "Wÿhle dein lieblings Style";
$content['LN_GEN_WEB_MAINTPPLAYERS'] = "Wieviele Spieler sollen auf der Hauptseite pro Seite angezeigt werden?";
$content['LN_GEN_WEB_TOPPLAYERS'] = "Wieviele Spieler sollen in den Spielerlisten pro Seite angezeigt werden?";
$content['LN_GEN_WEB_DETAILLISTTOPPLAYERS'] = "Wieviele Spieler sollen detailiert angezeigt werden?";
$content['LN_GEN_WEB_TOPROUNDS'] = "Wieviele Runden willst du pro Seite anzeigen?";
$content['LN_GEN_WEB_MAXPAGES'] = "Wieviele Seiten sollen aufgelistet werden auf der Seite?";
$content['LN_GEN_WEB_MINKILLS'] = "Wieviele Kills muss ein Spieler haben um aufgelistet zu werden?";
$content['LN_GEN_WEB_MINTIME'] = "Wieviel Sekunden muss ein Spieler gespielt haben um aufgelistet zu werden?";
$content['LN_GEN_WEB_SHOWMEDALS'] = "Anzeige der Medaillien auf der Hauptseite?";
$content['LN_GEN_WEB_SHOWANTIMEDALS'] = "Anti-Medaillien-Block auf der Hauptseite (Pro/Custom siehe Option dar?ber)";
$content['LN_ADMINPARSER'] = "Parser Auswahl";
$content['LN_PARSER_DEBUGMODE'] = "Debug Modus";
$content['LN_PARSER_DISABLELASTLOGLINE'] = "Die Position der Logzeile nicht speichern (Debug Modus)";
$content['LN_GEN_WEB_MAXMAPSPERPAGE'] = "Wieviele Maps sollen pro Seite aufgefÿhrt werden in der Server Statistik?";
$content['LN_GEN_GAMEVERSION'] = "Spiel Version";
$content['LN_GEN_PARSEBYTYPE'] = "Spieler verarbeiten nach ";
$content['LN_GEN_PHPDEBUG'] = "Aktiviere PHP Debugging";
$content['LN_PARSER_ENABLECHATLOGGING'] = "Aktiviere Chat Logging";
$content['LN_ADMINMEDALS'] = "Medal Options";
$content['LN_ADMINMEDALSENABLE'] = "Aktiviere '%1' Medaillen";
$content['LN_ADMINMEDALSGROUP_PRO'] = "Pro- / Skill-Medaillen";
$content['LN_ADMINMEDALSGROUP_ANTI'] = "Anti-Medaillen";
$content['LN_ADMINMEDALSGROUP_CUSTOM'] = "Eigene Medaillen";
$content['LN_ADMINMEDALSGROUP_ENABLEALL'] = "Alle Medaillen dieser Gruppe ein- oder ausschalten.";
$content['LN_ADMINMEDAL_AUTOSAVE_SAVING'] = "Speichere Konfiguration?";
$content['LN_ADMINMEDAL_AUTOSAVE_RECALC'] = "Medaillen werden neu berechnet?";
$content['LN_ADMINMEDAL_AUTOSAVE_DONE'] = "Medaillen aktualisiert.";
$content['LN_ADMINMEDAL_AUTOSAVE_ERR'] = "Speichern oder Neuberechnung fehlgeschlagen. Bitte Senden verwenden.";
$content['LN_ADMINPLAYERDETAILS'] = "Optionen fÿr Spielerdetails Seite";
$content['LN_GEN_PD_KILLERMODEL'] = "Hitlocation Model fÿr 'Treffezonen auf deine Gegenspieler'";
$content['LN_GEN_PD_KILLEDBYMODEL'] = "Hitlocation Model fÿr 'Wo du getroffen wurdest'";
$content['LN_GEN_WEB_GZIP'] = "Aktiviere GZIP Kompression";
$content['LN_GEN_WEB_BIGSELECTS'] = "Aktiviere SET SQL_BIG_SELECTS=1 fÿr Mysql";
$content['LN_GEN_WEB_MAXTIMEOUT'] = "Versuche die Script Ausfÿhrungs Zeit zu ÿberschreiben (in Sekunden)";
$content['LN_GEN_PREPENDTITLE'] = "Diesen Text an den Anfang des Seitentitels schreiben";
$content['LN_GEN_INJECTHTMLHEADER'] = "Diesen html code in den &lt;head&gt; Bereich einfÿgen.";
$content['LN_GEN_INJECTBODYHEADER'] = "Diesen html code direkt nach dem &lt;body&gt;-tags einfÿgen.";
$content['LN_GEN_INJECTBODYFOOTER'] = "Diesen html code vor dem Ende des &lt;body&gt;-tags einfÿgen.";
$content['LN_ADMIN_ULTRASTATS_LOGOURL'] = "Optionale UltraStats Logoadresse. Leer lassen, um das Standardlogo zu verwenden.";

// Server Page
$content['LN_ADMINCENTER_SERVER'] = "Server Administration";
$content['LN_CHANGESERVER'] = "Server Konfiguration ÿndern";
$content['LN_ADDSERVER'] = "Server hinzufÿgen";
$content['LN_EDITSERVER'] = "Server ÿndern";
$content['LN_SERVERNUMBER'] = "Nummer";
$content['LN_SERVERACTION'] = "Aktion";
$content['LN_SERVER'] = "Server";
$content['LN_SERVERID'] = "Server ID";
$content['LN_SERVERNAME'] = "Servername";
$content['LN_SERVERIP'] = "Server IP";
$content['LN_SERVERTOOLS'] = "Server Tools";
$content['LN_PORT'] = "Server Port";
$content['LN_DESCRIPTION'] = "Beschreibung";
$content['LN_MODNAME'] = "Modname";
$content['LN_ADMINNAME'] = "Adminname";
$content['LN_ADMINEMAIL'] = "Adminemail";
$content['LN_CLANNAME'] = "Clanname";
$content['LN_LASTLINE'] = "Letzte Logzeile";
$content['LN_GAMELOGLOCATION'] = "Lokaler Gamelog Pfad";
$content['LN_REMOTEGAMELOGLOCATION'] = "FTP Pfad der Gamelog";
$content['LN_SERVERENABLED'] = "Server Aktiv";
$content['LN_PARSINGENABLED'] = "Parsing Aktiv";
$content['LN_ADMINPARSESTATS'] = "Parser starten";
$content['LN_ADMINDELETESTATS'] = "Statistik lÿschen";
$content['LN_ADMINGETNEWLOG'] = "Neue Logdatei holen";
$content['LN_ADMINRESETLASTLOGLINE'] = "Zurÿcksetzten der letzten Logzeilen auf 0";
$content['LN_ADMINDBSTATS'] = "Server Datenbank Statistiken";
$content['LN_STATSALIASES'] = "Alle Aliases";
$content['LN_STATSCHATLINES'] = "Chat Zeilen";
$content['LN_STATSPLAYERS'] = "Alle Spieler";
$content['LN_STATSKILLS'] = "Alle Kills";
$content['LN_STATSROUNDS'] = "gespielte Runden";
$content['LN_STATSTIME'] = "Komplett gespielte Zeit";
$content['LN_SERVER_ERROR_INVID'] = "Fehler, nicht gÿltige ServerID, Server nicht gefunden";
$content['LN_SERVER_ERROR_NOTFOUND'] = "Fehler, Server '%1' wurde nicht gefunden";
$content['LN_SERVER_ERROR_SERVEREMPTY'] = "Fehler, Servername ist leer";
$content['LN_SERVER_ERROR_SERVERIPEMPTY'] = "Fehler, Serverip ist leer";
$content['LN_SERVER_ERROR_INVIP'] = "Fehler, nicht gÿltige Serverip";
$content['LN_SERVER_ERROR_INVPORT'] = "Fehler, Ports sind nur von 1 bis 65535 gÿltig";
$content['LN_SERVER_ERROR_GAMEFILENOTEXISTS'] = "Fehler, die Gamelogdatei existiert nicht. Bitte ÿberpÿfe den Ort der ausgewÿhlt wurde";
$content['LN_SERVER_ERROR_INDBALREADY'] = "Fehler, dieser Gameserver ist schon in der Datenbank!";
$content['LN_SERVER_SUCCEDIT'] = "Server '%1' wurde erfolgreich editiert";
$content['LN_SERVER_SUCCADDED'] = "Server '%1' wurde erfolgreich hinzugefÿgt";
$content['LN_SERVERLOGO'] = "ServerLogo";
$content['LN_RUNTOTALUPDATE'] = "Total/Final Berechnungen starten";
$content['LN_SERVERLIST'] = "Serverliste";
$content['LN_DATABASEOPT'] = "Optimiere Datenbank";
$content['LN_BUILDFTPSTRING'] = "Erstellen";
$content['LN_FTPPASSIVEENABLED'] = "Benutze FTP Passive Mode";
$content['LN_ADDITIONALFUNCTIONS'] = "Zusÿtzliche Funktionen";
$content['LN_CREATEALIASES'] = "Erstelle Aliases HTML Code";
$content['LN_CALCMEDALSONLY'] = "Kalkuliere Medals";
$content['LN_ADMINCREATEALIASES'] = "Erstelle Top Aliases";
$content['LN_ADMINEDIT_TEXT'] = "Klicke auf diesen Button um einen exsitierenden Servereintrag zu ÿndern.";
$content['LN_ADMINDELETE_TEXT'] = "Fall du diesen Servereintrag lÿschen willst, klick hier.";
$content['LN_ADMINPARSESTATS_TEXT'] = "Diese Funktion startet den Logfile parsing Process";
$content['LN_ADMINCREATEALIASES_TEXT'] = "Erstelle die meist genutzten Aliases fÿr diesen Servereintrag.";
$content['LN_ADMINDBSTATS_TEXT'] = "Zeige Datenbank Statistik Eigenschaften.";
$content['LN_ADMINRESETLASTLOGLINE_TEXT'] = "Zurÿcksetzten der zuletzt bekannten Logfile Position auf 0";
$content['LN_ADMINDELETESTATS_TEXT'] = "Lÿsche alle Statistiken fÿr diesen Server.";
$content['LN_ADMINGETNEWLOG_TEXT'] = "Downloade neues Gamelog von deinem Server. ";
$content['LN_RUNDAMAGETYPEKILLS'] = "Berechne gesamt Kills nach benutzten Schadenstypen.";
$content['LN_RUNWEAPONKILLS'] = "Berechne gesamt Kills nach benutzten Waffen.";
$content['LN_DATABASEOPT_MORE'] = "Benutze die eingebaute MYSQL Funktion um die Datenbank Tabellen zu optimieren.<br>Dies lÿscht vermutlich auch unbenutzte Tabellen.";
$content['LN_RUNTOTALUPDATE_MORE'] = "Dies beinhaltet zusammenfÿhrende Server Statistiken, Schadenstype Kills, Waffen Kills und meist genutzte Aliases.<br>Je nach grÿÿe deiner Datenbank, dies kÿnnte eine Weile dauern.<br><br>Sollte die Script Zeit wÿhrend diesem Arbeitsvorgang ÿberschritten werden, dann wird emphohlen diesen Schritt manuell vorzunehmen.";
$content['LN_RUNDAMAGETYPEKILLS_MORE'] = "Zusammenfÿhrung aller Kills gruppiert nach Schadenstypen.<br>Das Ergebnis wird in einer Hilfstabelle gespeichert und<br>fÿr jeden Server berechnet, Jahr und Monat.";
$content['LN_RUNWEAPONKILLS_MORE'] = "Zusammenfÿhrung aller Kills gruppiert nach Waffen.<br>Das Ergebnis wird in einer Hilfstabelle gespeichert und<br>fÿr jeden Server berechnet, Jahr und Monat.";
$content['LN_CREATEALIASES_MORE'] = "Berechne meist genutzte Aliases fÿr jeden Spieler in einer Hilfstabelle.<br>Dies wird auch fÿr eine Leistungssteigerung genutzt.";
$content['LN_CALCMEDALSONLY_MORE'] = "Berechne alle aktivierten Medaillen fÿr alle Server. ";
$content['LN_ADMINCREATEFTP_TEXT'] = "Diese Funktion hilft dabei, eine FTP Url zu erstellen.<br><br><b>Achtung!</b> Der Erstellen button ist erst verfÿgbar, sobald der Server hinzugefÿgt wurde!<br>Fÿge den Server also zuerst hinzu, und editiere ihn anschlieÿend, um die FTP Url zu erstellen.";

// Server FTP Builder
$content['LN_ADMINCENTER_FTPBUILDER'] = "FTP Builder";
$content['LN_ADMINCENTER_FTPBUILDER_DES'] = "Dieses Fenster soll dir helfen einen gÿltigen FTP Pfad zu erzeugen und zu ÿberprÿfen ob er funktioniert. Klicke auf den ÿberprÿfe FTP URL Button um zu prÿfen ob der Pfad ok ist.";
$content['LN_FTPBUILD_SERVERIP'] = "FTP ServerIP";
$content['LN_FTPBUILD_SERVERPORT'] = "FTP ServerPort";
$content['LN_FTPBUILD_USERNAME'] = "Benutzername";
$content['LN_FTPBUILD_PASSWORD'] = "Passwort (Optional)";
$content['LN_FTPBUILD_PATHTOGAMELOG'] = "Pfad zum Gamelog";
$content['LN_FTPBUILD_GAMELOGFILENAME'] = "Gamelog Filename";
$content['LN_FTPBUILD_ENABLEPASSIVE'] = "Aktiviere FTP Passive Mode";
$content['LN_FTPBUILD_GENERATE_FTPURL'] = "Erstelle FTP Url";
$content['LN_FTPBUILD_VERIFY_FTPURL'] = "ÿberprÿfe FTP Url";
$content['LN_FTPBUILD_SAVE_FTPURL'] = "Speichere FTP Url";
$content['LN_FTPBUILD_PREVIEW'] = "FTP Url Vorschau";
$content['LN_FTPBUILD_VERIFY'] = "FTP Url ÿberpÿfen";
$content['LN_FTPBUILD_SAVEDCLOE'] = "Der neue FTP Pfad wurde erfolgreich gespeichert. Das Fenster schliesst sich in 5 Sekunden automatisch und aktuallisiert den Server Admin. Falls es nicht funktioniert klicke auf Button!";

// Parser Page
$content['LN_ADMINCENTER_PARSER'] = "Server Parsing";
$content['NO_INFRAME_POSSIBLE'] = "Unglÿcklicherweise unterstÿtzt Ihr Browser kein Inframes und der Parser kann nicht gestartet werden!";
$content['LN_EMBEDDED_PARSER'] = "Eingebauten Parser laufen lassen";
$content['LN_PARSER_CANCEL'] = "Parsing abbrechen";
$content['LN_PARSER_CANCELLING'] = "Wird beim n?chsten sicheren Punkt abgebrochen?";
$content['LN_PARSER_CANCELLED_STATUS'] = "Parsing wurde abgebrochen.";
$content['LN_PARSER_DONE'] = "FERTIG";
$content['LN_PARSER_RETURN_SERVERLIST'] = "Zurueck zur Serverliste";
$content['LN_WARNINGDELETE'] = "Warnung! Beim lÿschen des Servers werden auch die Statistiken gelÿscht!";
$content['LN_WARNINGDELETE_STATS'] = "Warnung! Alle Statistiken fÿr Server '%1' werden gelÿscht. Willst du dies wirklich tun?";
$content['LN_DELETEYES'] = "Hier klicken um das Lÿschen des Servers zu Bestÿtigen";
$content['LN_DELETENO'] = "Hier klicken um auf die vorherige Seite zu gelangen";
$content['LN_FTPLOGINFAILED'] = "FTP Login gescheitert, oder kein Passwort vergeben.";
$content['LN_FTPPASSWORD'] = "FTP Passwort";

// User Page
$content['LN_USER_CENTER'] = "Benutzer Administration";
$content['LN_USER_NAME'] = "Benutzername";
$content['LN_USER_ADD'] = "Benutzer hinzufÿgen";
$content['LN_USER_EDIT'] = "Benutzer editieren";
$content['LN_USER_PASSWORD1'] = "Passwort";
$content['LN_USER_PASSWORD2'] = "Passwort wiederholen";
$content['LN_USER_ERROR_IDNOTFOUND'] = "Fehler, Benutzer mit der ID '%1' , wurde nicht gefunden";
$content['LN_USER_ERROR_WTFOMFGGG'] = "Fehler, ÿhm wtf du hast kein Benutzername omfg pls mowl?";
$content['LN_USER_ERROR_DONOTDELURSLF'] = "Fehler, du kannst dich NICHT selbst lÿschen!";
$content['LN_USER_ERROR_DELUSER'] = "Fehler, beim lÿschen des Benutzers!";
$content['LN_USER_ERROR_INVALIDID'] = "Fehler, nicht gÿltige ID, Benutzer wurde nicht gefunden";
$content['LN_USER_ERROR_HASBEENDEL'] = "Benutzer '%1' wurde erfolgreich gelÿscht!";
$content['LN_USER_ERROR_USEREMPTY'] = "Fehler, Benutzername war leer";
$content['LN_USER_ERROR_USERNAMETAKEN'] = "Fehler, dieser Benutzername wurde schon verwendet!";
$content['LN_USER_ERROR_PASSSHORT'] = "Fehler, Passwort war zu kurz, oder es gab keine ÿbereinstimmung";
$content['LN_USER_ERROR_HASBEENADDED'] = "Benutzer '%1' wurde erfolgreich hinzu gefÿgt";
$content['LN_USER_ERROR_HASBEENEDIT'] = "Benutzer '%1' wurde erfolgreich editiert";
$content['LN_USER_WARNDELETEUSER'] = "Bist du sicher das du Benutzer '%1' lÿschen willst?";

// General Options
$content['LN_GEN_LANGUAGE'] = "Sprache auswÿhlen";

// Players Page 
$content['LN_PLAYER_EDITOR'] = "Spieler Editor"; 
$content['LN_PLAYER_NAME'] = "Meist genutzter Name"; 
$content['LN_PLAYER_GUID'] = "GUID"; 
$content['LN_PLAYER_PBGUID'] = "Punkbuster GUID"; 
$content['LN_PLAYER_CLANMEMBER'] = "Ist Clanmember?"; 
$content['LN_PLAYER_BANNED'] = "Gebannter Spieler?"; 
$content['LN_PLAYER_BANREASON'] = "Ban Grund!"; 
$content['LN_PLAYER_EDIT'] = "Spieler editieren"; 
$content['LN_PLAYER_DELETE'] = "Spieler lÿschen"; 
$content['LN_PLAYER_ERROR_NOTFOUND'] = "Fehler, Spieler mit GUID '%1' wurde nicht gefunden"; 
$content['LN_PLAYER_ERROR_INVID'] = "Fehler, nicht gÿltige Spieler ID!"; 
$content['LN_PLAYER_ERROR_PLAYERIDEMPTY'] = "Spieler, Spieler ID was leer!"; 
$content['LN_PLAYER_ERROR_NOTFOUND'] = "Fehler, Spieler mit GUID '%1' wurde nicht gefunden in der Datenbank!"; 
$content['LN_PLAYER_SUCCEDIT'] = "Spieler mit GUID '%1' wurde erfolgreich editiert!"; 
$content['LN_PLAYER_FILTER'] = "Spieler filtern nach "; 
$content['LN_PLAYER_DOFILTER'] = "Filter anwenden";
$content['LN_WARNING_DELETEPLAYER'] = "Warnung, durch Lÿschung dieses Spielers werden auch alle zusammenhÿngende Statistiken wie Kills oder Deaths des Spielers gelÿscht ;)!";
$content['LN_PLAYER_SQLCMD'] = "SQL Befehl";
$content['LN_PLAYER_SQLTABLE'] = "SQL Tabelle";
$content['LN_PLAYER_AFFECTEDRECORD'] = "Bettroffende Eintrÿge";
$content['LN_PLAYER_DELETED'] = "gelÿscht";
$content['LN_PLAYER_BACKPLAYERLIST'] = "Zurÿck zur Playerliste";
$content['LN_PLAYER_PLAYERCOUNT'] = "'%1' Spieler gefunden.";

// Upgrade Page
$content['LN_DBUPGRADE_TITLE'] = "UltraStats Datenbank update";
$content['LN_DBUPGRADE_DBFILENOTFOUND'] = "Die Datenbank Update Datei '%1' kann nicht gefunden werden im contrib Ordner! Bitte ÿberÿfe alle Datein, du hast vielleicht vergessen die Update Datein zu uploaden.";
$content['LN_DBUPGRADE_DBDEFFILESHORT'] = "Die Datenbank Update Datein waren leer oder es wurden keine SQL Commands gefunden! Bitte ÿberÿfe alle Datein, du hast vielleicht vergessen die Update Datein zu uploaden.";
$content['LN_DBUPGRADE_WELCOME'] = "Willkommen zum Datenbank Update!";
$content['LN_DBUPGRADE_BEFORESTART'] = "Bevor die Datenbank geupdatet werden soll wird ein volles Datenbank Backup empfohlen! Alles sonst wird automatisch durch das Update Script ausgefÿhrt.";
$content['LN_DBUPGRADE_CURRENTINSTALLED'] = "Aktuell installierte Datanbank Version";
$content['LN_DBUPGRADE_TOBEINSTALLED'] = "Zu installierende Datenbank Version";
$content['LN_DBUPGRADE_HASBEENDONE'] = "Datenbank Update wurde ausgefÿhrt, schau dir die nachstehenden Ergebnisse an";
$content['LN_DBUPGRADE_SUCCESSEXEC'] = "Statements Erfolgreich ausgefÿhrt";
$content['LN_DBUPGRADE_FAILEDEXEC'] = "Statements fehlgeschlagen";
$content['LN_DBUPGRADE_ONESTATEMENTFAILED'] = "mindestens ein Statement ist fehlgeschlagen, schau dir den nachstehenden Fehler an";
$content['LN_DBUPGRADE_ERRMSG'] = "Fehlermeldung";
$content['LN_DBUPGRADE_ULTRASTATSDBVERSION'] = "UltraStats Datenbank Version";

// String Editor
$content['LN_ADMIN_STREDITOR'] = "String Editor";
$content['LN_STRING_EDIT'] = "Editiere String";
$content['LN_STRING_FILTER'] = "Stringfilter";
$content['LN_STRED_DOFILTER'] = "Filtern Starten";
$content['LN_STRED_LANG'] = "Sprache";
$content['LN_STRED_STRINGID'] = "StringID";
$content['LN_STRED_TEXT'] = "Text";
$content['LN_STRED_ACTION'] = "Verfÿgbare Actions";
$content['LN_WARNING_DELETESTRING'] = "Willst du wirklich diesen String lÿschen?";
$content['LN_STRING_BACKSTRINGLIST'] = "Zurÿck zur Stringliste";
$content['LN_STRING_ERROR_NOTFOUND'] = "Kein String mit ID '%1' gefunden!";
$content['LN_STRING_ERROR_INVID'] = "Ungÿltige StringID";
$content['LN_STRING_ERROR_IDEMPTY'] = "StringID ist leer!";
$content['LN_STRING_SUCCEDIT'] = "Der String mit der ID '%1' wurde erfolgreich editiert.";
$content['LN_STRING_ADD'] = "Neuen String hinzufÿgen";
$content['LN_STRING_ERROR_ALREADYEXISTS'] = "StringID existiert bereits.";
$content['LN_STRING_SUCCADDED'] = "Der String mit ID '%1' wurder erfolgreich hinzugefÿgt.";
$content['LN_STRING_DELETEDSTRING'] = "Der String mit ID '%1' wurde erfolgreich gelÿscht.";
$content['LN_STRING_'] = "";

// result helper page
$content['LN_RESULT_REDIRTXT'] = 'Du wirst weitergeleitet zu<a href="%1">dieser Seite</a> in %2 Sekunden.';
$content['LN_RESULT_REDIRTITLE'] = "Weiterleitung in %1 Sekunden.";

?>