import {React, useRef, useState, useEffect} from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import {Table} from 'antd';

import './styles/Players.css';

const playerCols = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName',fixed:'left' },
    { title: 'Position', dataIndex: 'defaultPositionId', key: 'defaultPositionId' },
    { title: 'ADP', dataIndex: ['ownership', 'averageDraftPosition'], key:['ownership', 'averageDraftPosition']},
    { title: 'Team', dataIndex: 'proTeamId', key: 'proTeamId'},
  ];

const originalColNum = playerCols.length;

function Players({draftPlayer, players, nextPick}) {

    const dumb = (record) => {
        console.log("dumb");
        draftPlayer(record);
    }

    const draftButton = (text, record, index) => (
        <Button 
            onClick={(e) => draftPlayer(record, index)}
            disabled={record.hasOwnProperty('drafted') && record.drafted} //disable draft button if player was drafted already
        >
            Draft
        </Button>
    )

    /*
    For whatever reason, if you define the columns of the antd table within the component function,
    the table header is hidden whenever the state of component being displayed changes.
    In this usecase, one of the columns needs to be rendered using a function that is passed in
    as a parameter to the component, so the columns cant fully be defined outside of the component.
    To get around this, all constant columns are defined outside of the component function, and then
    the one column that requires the passed in function is added to the list within the function. 
    This seems to get around the problem.
    */
    if (playerCols.length < originalColNum + 1) {
        // playerCols.push({ title: 'Draft', render: (text, record, index) => (<Button onClick={(e) => draftPlayer(record, index)}>Draft {index}</Button>)});
        playerCols.push({ title: 'Draft', render: draftButton});

    }

    const executePick = (e, record) => {
        e.preventDefault();
        console.log('draft player:');
        console.log(record)
        draftPlayer(record);
    }
    
    function draftBoy(text, record, index) {
        // console.log(text);
        // console.log(record);
        // console.log(index);
        return (
            <Button onClick={(e)=>executePick(e, record)}>Draft</Button>
        )
    };
    
    // const playerCols = [
    //     { title: 'Name', dataIndex: 'fullName', key: 'fullName',fixed:'left' },
    //     { title: 'Position', dataIndex: 'defaultPositionId', key: 'defaultPositionId' },
    //     { title: 'ADP', dataIndex: ['ownership', 'averageDraftPosition'], key:['ownership', 'averageDraftPosition']},
    //     { title: 'Team', dataIndex: 'proTeamId', key: 'proTeamId'},
    //     {title: 'Draft', dataIndex:'draft', key:'draft', fixed:'right', render: draftBoy},
    //   ];

    /*
    TODO: make the table so that by default it only displays undrafted players
    */

    return (
        <div id="papi">
        <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
            <Accordion.Header>Players {nextPick}</Accordion.Header>
            <Accordion.Body style={{height:'400px', overflowY:'auto'}}>
                <Table
                    dataSource={players}
                    columns={playerCols}
                    pagination={false}
                    scroll={{y:'90vh'}}
                    rowKey={(record) => record.id}
                    loading={players.length == 1}
                />
            </Accordion.Body>
        </Accordion.Item>
        </Accordion>
      </div>
    )
}

export default Players;