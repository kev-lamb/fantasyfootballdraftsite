# fantasyfootballdraftsite

Basic Outline of Setup (WIP)

# Web Application Approach:

# React Frontend

# Express Backend:
communicates directly with react frontend, manages web sockets for instant updates during drafts, sessions to maintain multiple different drafts simultaneously.

# DynamoDB: 
maintain table of complete player pool and all player specific information. Can schedule daily updates to get most recent ADP information from my multiple sources. Can also wait to implement this later and continue to rely on directly querying the ESPN fantasy API when I need to get the full list of players.

# Amazon RDS: 
primary key = draft_id, secondary key = player_id, additional rows: (adp, position). Table of available players in active drafts. When a draft begins, a row for every player is created with primary key draft_id. As players get drafted, the row is deleted. When the draft is finished, all remaining rows with that drafted are deleted (undrafted players).

# Amazon S3: 
folders named by draft_id contain 2 json files: 1. Rosters of each team, 2. List of all unrostered players (this second file might not be needed, definitely not a priority to implement)

# AWS Lambda: 
during drafts, the express backend will communicate the lambda endpoints to request a CPU selection as well as to inform about human selections. These endpoints will interact directly with the RDS instance.
