import {React, useState, useRef, useEffect} from 'react';
import { Table } from 'antd';
import Button from 'react-bootstrap/Button';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    width: 150,
  },
  {
    title: 'Age',
    dataIndex: 'age',
    width: 150,
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];

const playerCols = [
    { title: 'Name', dataIndex: 'fullName', key: 'fullName',fixed:'left' },
    { title: 'Position', dataIndex: 'defaultPositionId', key: 'defaultPositionId' },
    { title: 'ADP', dataIndex: ['ownership', 'averageDraftPosition'], key:['ownership', 'averageDraftPosition']},
    { title: 'Team', dataIndex: 'proTeamId', key: 'proTeamId'},
    // { title: 'Draft', render: (text, record, index) => (<Button onClick={(e) => console.log(record)}>Draft</Button>)}
  ];

const Test = ({data, draftPlayer}) => {

    if (playerCols.length < 5) {
        playerCols.push({ title: 'Draft', render: (text, record, index) => (<Button onClick={(e) => draftPlayer(record)}>Draft</Button>)});
    }

    // const playerCols = [
    //     { title: 'Name', dataIndex: 'fullName', key: 'fullName',fixed:'left' },
    //     { title: 'Position', dataIndex: 'defaultPositionId', key: 'defaultPositionId' },
    //     { title: 'ADP', dataIndex: ['ownership', 'averageDraftPosition'], key:['ownership', 'averageDraftPosition']},
    //     { title: 'Team', dataIndex: 'proTeamId', key: 'proTeamId'},
    //   ];

//     const [data, setData] = useState([]);

//     useEffect(() => {
//         const datak = [];
//         for (let i = 0; i < 100; i++) {
//             datak.push({
//                 key: i,
//                 name: `Edward King ${i}`,
//                 age: 32,
//                 address: `London, Park Lane no. ${i}`,
//         });

//   setData(datak);
// }
//     }, [])

  return (<Table
    columns={playerCols}
    dataSource={data}
    pagination={false}
    scroll={{
      y: 240,
    }}
  />)
};
export default Test;