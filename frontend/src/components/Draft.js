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
    const [test, setTest] = useState(1);

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
        setRosters(newBoard)
        }
        

    }, [nextPick]);

    // const playerCols = [
    //     { title: 'Name', dataIndex: 'fullName', key: 'fullName',fixed:'left' },
    //     { title: 'Position', dataIndex: 'defaultPositionId', key: 'defaultPositionId', width:150 },
    //     { title: 'ADP', dataIndex: ['ownership', 'averageDraftPosition'], key:['ownership', 'averageDraftPosition'], width:150},
    //     { title: 'Team', dataIndex: 'proTeamId', key: 'proTeamId', width:150},
    //     {title: 'Draft', dataIndex:'draft', key:'draft', fixed:'right', render: draftBoy},
    //   ];

    //   function draftBoy(text, record, index) {
    //     // console.log(text);
    //     // console.log(record);
    //     // console.log(index);
    //     return (
    //         <Button onClick={(e)=>executePick(e, record)}>Draft</Button>
    //     )
    // };

    // const executePick = (e, record) => {
    //     e.preventDefault();
    //     console.log('draft player:');
    //     console.log(record)
    //     draftPlayer(record);
    // }


    return (
        <div style={{display:'flex', flexDirection:'column', height:'100vh'}}>
            <DraftBoard teams={teams} rounds={rounds} rosters={rosters} setRoster={setRosters} style={{flex:60}}/>
            <Players draftPlayer={draftPlayer} players={players} style={{flex:40}}/>
        </div>
        // <Players draftPlayer={draftPlayer} players={players}/>
        // <div style={{height:'600px', overflowY:'auto'}}>
        //     <Table
        //             dataSource={players}
        //             columns={playerCols}
        //             pagination={false}
        //             scroll={{y:400}}
        //             rowKey={(record) => record.id}
        //         />
        // </div>
        // <div>
        //     <Button onClick={(e)=>{setTest(test+1)}}>{test}</Button>
        //     <Test data={players} draftPlayer={draftPlayer}/>
        // </div>
    )
}

export default Draft;