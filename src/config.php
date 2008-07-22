<?php
					/*
						*********************************************************************
						* Copyright by Andre Lorbach | 2006, 2007, 2008						*
						* -> www.ultrastats.org <-											*
						*																	*
						* Use this script at your own risk!									*
						* -----------------------------------------------------------------	*
						* Main Configuration File											*
						*																	*
						* -> Configuration need variables for the Database connection		*
						*********************************************************************
					*/

					// --- Database options
					$CFG['DBServer'] = "localhost";
					$CFG['Port'] = 3306;
					$CFG['DBName'] = "ultrastatscod5"; 
					$CFG['TBPref'] = "stats_"; 
					$CFG['User'] = "ultrastats";
					$CFG['Pass'] = "ultrastats";

					$CFG["ShowPageRenderStats"] = 1;						// If enabled, you will see Pagerender Settings
					$CFG["ShowDebugMsg"] = 0;								// Print additional debug informations!					

?>