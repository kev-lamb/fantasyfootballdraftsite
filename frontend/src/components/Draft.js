import {React, useRef, useState, useEffect} from 'react';
import DraftBoard from './Draftboard';
import Players from './Players';
import {API_URL} from '../config';
import Button from 'react-bootstrap/Button';
import {Table} from 'antd';
import Test from './Test';

const initialSelection = {
    fullName: 'N/A',
    defaultPositionId: 'N/A',
    proTeamId: 'N/A',
    ownership: {averageDraftPosition: 'N/A'}
};

function Draft({teams, rounds}) {

    const [rosters, setRosters] = useState(Array.from({ length: teams }, () => Array.from({length: rounds}, () => '')));
    const [nextPick, setNextPick] = useState(-1);
    const [players, setPlayers] = useState([initialSelection]);
    const [selection, setSelection] = useState(initialSelection);
    const [userTeam, setUserTeam] = useState(null);

    // fetch list of players on page load
    useEffect(() => {

        const fetchPlayers = async () => {
            let url = new URL(`${API_URL}/espnadp`);
            url.searchParams.append("start", 0);
            url.searchParams.append("size", 300);

            fetch(url)
                .then(res => res.json())
                .then(res => {
                    setPlayers(res);
                })
        }
        console.log('triggered useeffect')
        fetchPlayers();

    }, [])

    useEffect(() => {
        //when the selection is set, increement pick number
        // and add selection to draft board
        console.log('running selection useffect');
        console.log(players);
        if (selection != initialSelection) {
            //find player in list of players and mark them as drafted
            // let playerIndex = players.findIndex(p => p.id === selection.id)
            // let newPlayerList = [...players];
            // newPlayerList[playerIndex] = {...players[playerIndex], drafted: true};
            // setPlayers(newPlayerList);

            //increment pick number
            setNextPick(nextPick => nextPick+1);
        }
    }, [selection])


    const draftPlayer = (player, index) => {
        //make sure player can be drafted
        console.log(player);

        //mark player as drafted in players list
        setPlayers(players => {
            let newPlayerList = [...players];
            newPlayerList[index] = {...players[index], drafted: true};
            return newPlayerList;
        })


        // indicate that this player has been drafted via record
        setSelection(player);

    }

    const teamOnClock = (pick) => {
        let round = Math.floor(pick/teams);
        let team = round % 2 == 0 ? pick % teams : teams - (pick % teams) - 1;
        return team;
    };

    useEffect(() => {
        console.log('just made next pick into: ')
        console.log(nextPick)

        //calculate which round/team is making the selection that just incremented the count
        if (nextPick != -1) {

            let round = Math.floor(nextPick/teams);
            let team = round % 2 == 0 ? nextPick % teams : teams - (nextPick % teams) - 1;

            //push new selection to the draft board
            const newBoard = [...rosters];
            newBoard[team] = [...newBoard[team]];
            newBoard[team][round] = {name: selection.fullName, position: selection.defaultPositionId};
            setRosters(newBoard);
        }
        

    }, [nextPick]);

    const draftNotOver = () => {
        return nextPick < teams * rounds;
    }

    const startDraft = () => {
        //if CPU is on clock, fetch selection from api
        while (draftNotOver()) {
            //if CPU is on clock, fetch selection from api

        }
    };

    /*
    Draft control flow
    Draft state should increment 'nextPick' when the value of 'selection' has changed.

    If the current team 'on the clock' is a user controlled team, we wait for the user to click
    the draft button on an available player, which changes the value of selection and executes
    the 'draftPlayer' logic.

    If the current team 'on the clock' is a CPU, send a get request to the API for the next pick
    in the draft

    It seems like the changing of the value 'nextPick' is what should trigger this behavior, so
    I think it makes the most sense to handle this in a useEffect when 'nextPick' encounters a 
    state change.

    The only problem is right now, changing the value of selection is what triggers a state change
    for 'nextPick'. I think what I can do is within the useEffect, check for what the team after
    the one that just selected is, and make an async fucntion call that sets selection.

    To implement this, we have to either send the entire list of available players in our request
    OR maintain the list of available players in the backend as the draft progresses. I think
    maintaining this in the backend is more scalable and sending that list over feels like itd be slow,
    but sending the list over is easier to implement so ill try that first.

    the players list is actually to large to send in the body of the post request, so we need to come
    up with a mock storage solution now
    */

    /*
    Think i need to handle the cpu selection stuff on roster state change instead of pick number actually
    cuz I want to send updated roster info to server and async state change wont have happened yet if i handle
    it w pick number change. Thisll matter for CPUs picking at the turn
    */
    useEffect(() => {
        const requestCPUPick = async (team, roster) => {

            let info = {
                available: 'hehehe', // players.filter(player => !player.hasOwnProperty('drafted') || !player.drafted),
                team: team,
                roster: roster
            };

            let url = new URL(`${API_URL}/draft`);
            fetch(url, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(info)
            }).then(res => res.json())
            .then(res => {
                console.log(res);
            })
        }

        //check if the next team to draft is a user team or a CPU
        let otc = teamOnClock(nextPick+1);
        if (otc != userTeam) {
            //CPU picking, send request
            requestCPUPick(otc, rosters[otc]);

        }

    }, [rosters])


    return (
        <div style={{display:'flex', flexDirection:'column', height:'100vh'}}>
            <Button onClick={(e) => startDraft()}>Start Draft</Button>
            <DraftBoard 
                teams={teams}
                rounds={rounds}
                rosters={rosters}
                setRoster={setRosters}
                userTeam={userTeam}
                setUserTeam={setUserTeam}
                style={{flex:60}}
            />
            <Players draftPlayer={draftPlayer} players={players} style={{flex:40}}/>
        </div>
    )
}

export default Draft;