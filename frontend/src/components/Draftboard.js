/*
react component to display full draftboard. Basically an organized array of draftcards.

IDEA: i think it might be interesting to add a display option that alters the order from
pick number to roster layout for each team. So instead of the first row being round 1 for all
teams, it would be the qb slot for each team (potentially unfilled), then rows 2-3 would be
rbs, 4-5 wrs, etc. You could toggle between this and the standard display.
*/

import {React, useRef, useState, useEffect} from 'react';
import DraftCard from './Draftcard';
import './styles/Draftboard.css';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

/**
 * reorients 2d array of team rosters to be an array of
 * each round of the draft
 * @param {*} teams 
 */
const roundWise = (teams) => {

};

/**
 * reorients 2d array of team rosters to be structures by 
 * roster spots (qbs lined up w qbs, et al)
 * @param {*} teams 
 */
const rosterConstruction = (teams) => {

};


function DraftBoard({teams, rounds, rosters, setRosters, userTeam, setUserTeam}) {

    //maintains roster information
    // const [rosters, setRosters] = useState(Array.from({ length: teams }, () => Array.from({length: rounds}, () => 'jeff')));
    const [nextPick, setNextPick] = useState(1);
    const [teamNames, setTeamNames] = useState(Array.from({ length: teams }, (_, index) => `Team ${index + 1}`));
    // const [userTeam, setUserTeam] = useState(null);


    const addToDraftBoard = (player) => {
        //determine which pick this is meant to be
        let round = Math.floor(nextPick/teams)
        let team = nextPick % teams;

        const newBoard = [...rosters];
        newBoard[team] = [...newBoard[team]];
        newBoard[team][round] = player
        setRosters(newBoard);
    }


    return (
        <div style={{overflow:'scroll'}}>
        <Table responsive>
            <thead>
                <tr>
                {
                    teamNames.map((name, i) => (
                        <th>
                        <Button onClick={(e) => setUserTeam(i)}>
                            {userTeam == i ? 'USER' : 'Claim'} {name}
                        </Button>
                        </th>
                    ))
                }
                </tr>
            </thead>
            <tbody>
            {
                rosters[0].map((_, round) => (
                    <tr>
                        {rosters.map((team, i) => (
                            <td style={{padding:'0px'}}>
                                <DraftCard content={{player: team[round].name, round: round, pick: i, teams: teams, position: team[round].position}}/>
                            </td>
                        ))}
                    </tr>
                    
                ))
            }
            </tbody>
        </Table>
        </div>
    )

}

export default DraftBoard;