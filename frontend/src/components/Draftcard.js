/*
react component to display information on a single pick during a draft. 
*/

import {React, useRef, useState, useEffect} from 'react';
import './styles/Draftcard.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import {Card} from 'react-bootstrap';

const positionColors = {
    3: '#82aafb',   //wr
    2: '#7efc7a',   //rb
    1: '#fc7a7a',   //qb
    4: '#f5fc7a',   //te
    16: '#e4bb5f',  //dst
    5: '#cf7afc'    //k
};

const headerColors = {
    3: '#125ffb',   //wr
    1: '#fb1212',   //qb
    5: '#ae16fe',   //k
    2: '#08af05',   //rb
    4: '#969803',   //te
    16: '#986a04'   //dst

}

const positionCodes = {
    1: 'QB',
    2: 'RB',
    3: 'WR',
    4: 'TE',
    5: 'K',
    16: 'D/ST'
}


function DraftCard({content}) {

    return (
        <Card style={{width:'8vw', height:'12vh'}}>
            <Card.Header style={{backgroundColor:headerColors[content.position], height:'20%', padding:'2px 10px', fontSize:'75%'}}>
                {content.round + 1}.{content.round % 2 == 0 ? content.pick + 1 : content.teams - content.pick}
            </Card.Header>
            <Card.Body style={{backgroundColor:positionColors[content.position], height:'80%'}}>
                <Card.Title className='two-wrap' style={{fontSize:'100%', margin:'-5px'}}>
                    {content.player}
                </Card.Title>
                <Card.Text>
                    {positionCodes[content.position]}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default DraftCard;