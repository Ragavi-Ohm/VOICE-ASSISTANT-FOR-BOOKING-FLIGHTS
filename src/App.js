import logo from './image_8.png';
import './App.css';
import Dropdown from 'react-bootstrap/Dropdown'
import React, { useState } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Button from 'react-bootstrap/Button';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import alanBtn from '@alan-ai/alan-sdk-web';
import { useEffect } from 'react';
import axios from 'axios';
import data from './json_data.json'
import Table from 'react-bootstrap/Table';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import pdata from './passenger_data.json';


function App() {
  const [checked, setChecked] = useState(false);
  const [Class, setClass] = useState('');
  const [noChildren, setNoChildren] = useState('');
  const [fromDate, setfromDate] = useState('');
  const [fromDir, setfrom] = useState('');
  const [toDir, setto] = useState('');
  const [noAud, setAud] = useState('');
  var [photo, setPhoto] = useState('');
  const [selectedFile, setSelectedFile] = useState()
  const [text, setText] = useState('');
  const [displayText, setDisplayText] = useState('');
    const [preview, setPreview] = useState()
  var [Message, setMessage] = React.useState('')
  const ALAN_Key = `79991b74bec64eb0a8501542d241984e2e956eca572e1d8b807a3e2338fdd0dc/stage`
  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Popover right</Popover.Header>
      <Popover.Body>
        And here's some <strong>amazing</strong> content. It's very engaging.
        right?
      </Popover.Body>
    </Popover>
  );
  

  const handleClick = event => {
    event.preventDefault();

   
    console.log('handleClick', pdata);
  };
  const handleSub = e => {
    e.preventDefault();
    setDisplayText(text);
  };

  const handleChange = e => {
    setText(e.target.value);
  };

  useEffect(() => {
    if (!selectedFile) {
        setPreview(undefined)
        return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl)
}, [selectedFile])
  const uploadHandler = e => {
    
    if (!e.target.files || e.target.files.length === 0) {
        setSelectedFile(undefined)
        return
    }
    setSelectedFile(e.target.files[0]) 
    console.log(preview)
    axios.post('http://127.0.0.1:5000/readpassport', {
                image: preview,
            },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
                .then(res => {
                    console.log(`response = ${res.data}`)
                })
                .catch(error => {
                    console.log(`error = ${error}`)
                })
}


  function handleSubmit(e) {
    e.preventDefault();
    if (fromDir === '' || toDir === '' || noAud === '' || Class === '' || noChildren === '' || fromDate === '') { alert('Please fill all the fields below!!') }
    while (fromDir !== '' && toDir !== '' && noAud !== '' && Class !== '' && noChildren !== '' && fromDate !== '') {
      axios.post('http://127.0.0.1:5000/searchflight', {
        Source: fromDir,
        Destination: toDir,
        StartDate: fromDate,
        ChildrenCount: noChildren,
        AdultCount: noAud,
        Class: Class
      },
        {
          headers: {
            'Content-Type': 'application/text'
          }
        }
      )
        .then(res => {
          console.log(`response = ${res.data}`)
          setMessage(res.data)
          console.log(res)
          setChecked(true)
          
        })
        .catch(error => {
          console.log(`error = ${error}`)
        })
      break;
    }

  }
  useEffect(() => {
    alanBtn({
      key: ALAN_Key,
      onCommand: (commandData) => {
        if (commandData.command === 'Class') {
          setClass(commandData.data)
        }
        if (commandData.command === 'noChildren') {
          setNoChildren(commandData.data)
        }
        if (commandData.command === 'noAud') {
          setAud(commandData.data)
        }
        if (commandData.command === 'fromDate') {
          setfromDate(commandData.data)
        }
        if (commandData.command === 'fromDir') {
          setfrom(commandData.data)
        }
        if (commandData.command === 'toDir') {
          setto(commandData.data)
        }
      }
    });
  }, []);
  
  
  return (
    <div className="App">
      <div class="header">
        <img id="logo" src={logo} />
        <h1 id="title"></h1>
        <div id="mid">

          <div class="emp">

          </div>
          <table id="tab3" cellPadding={"10px"} align={"center"}>
            <tr>
              <td><label for="from"><p class="h1">From:</p></label>&nbsp;&nbsp;&nbsp;
                <input id="from" name='fromDir' onChange={(event) => setfrom(event.target.value)} value={fromDir} type='text'  /> </td>

              <td><label for="to"><p class="h1">To:</p></label>&nbsp;&nbsp;&nbsp;
                <input id="to" name='toDir' onChange={(event) => setto(event.target.value)} value={toDir} type='text'  /></td>
              <td><label for="depart"><p class="h1">Depart:</p></label>&nbsp;&nbsp;&nbsp;
                <input type="text" id="depart" name='date' onChange={(event) => setfromDate(event.target.value)} value={fromDate} /></td>


            </tr>
          </table>

          <div class="emp">

          </div>
          <table id="tab" cellPadding={"7px"} align={"center"}>
            <tr>
              <td><label for="nos"><h6 class="h1">Number of Adults:</h6></label>&nbsp;&nbsp;&nbsp;
                <input id="nos" name='way' onChange={(event) => setAud(event.target.value)} value={noAud} type='text' /></td>

              <td><label for="noc"><h6 class="h1">No. of Children:</h6></label>&nbsp;&nbsp;&nbsp;
                <input id="noc" name='fromDir' onChange={(event) => setNoChildren(event.target.value)} value={noChildren} type='text'/></td>


              <td><label for="cab"><h6 class="h1">Cabin class:</h6></label>&nbsp;&nbsp;&nbsp;
              <input id="cab" name="name" onChange={(event) => setClass(event.target.value)} value={Class} type='text' />
              </td>

            </tr>
          </table>
          <div class="search">
          
          <Button variant="primary" onClick={handleSubmit} onchange={()=>{setChecked(false)}}className="bttn">Submit</Button>{' '}
            
            
          
          </div>
        </div>
        <h1 id="tagline">"Let us be your travel companion."</h1>


        {checked===true && <div class="display">
          <h1 id="head1" align={"center"}><Button variant="success">RESULTS</Button>{' '}</h1>
          
          <Table striped bordered hover>
      <thead>
        <tr>
        <th>Category</th>
              <th>From</th>
              <th>to</th>
              <th>departure time</th>
              <th>travel time</th>
              <th>No of stops</th>
              <th>fare</th>
              <th>carrier name</th>
              <th>Booking</th>
        </tr>
      </thead>
      <tbody>
      {data.map((data, index) => (  
              <tr data-index={index}>  
                <td>{data.tag}</td>
                <td>{data.source.id}</td>  
                <td>{data.destination.id}</td>  
                <td>{data.departure_time}</td>
                <td>{data.travel_time}</td>
                <td>{data.num_stops}</td>
                <td>{data.fare}</td>
                <td>{data.carrier_name}</td>
                <td><a href={data.booking_url}><Button variant="primary">Book now</Button>{' '}</a></td>
              </tr>  
            ))}  
      </tbody>
    </Table>

    <div class="pass">
          <h1 align={"center"} class="phead">Passenger details</h1>
          <p>{pdata.Age}</p>
          <table class="adult" cellPadding={"10px"} align={"center"} cellSpacing={"10px"}>
            <tr>
              <th><h1>Passenger 1</h1></th>
            </tr>
            <tr>
            <td><label for="fn"><h6 class="h1">First Name:</h6></label>&nbsp;&nbsp;&nbsp;
                <input id="fn" name='fn'  value={pdata.FirstName} type='text' onChange={handleChange}   autoComplete="off" /></td>
            <td><label for="ln"><h6 class="h1">Last Name:</h6></label>&nbsp;&nbsp;&nbsp;
                <input id="ln" name='ln'  value={pdata.SurName} type='text' onChange={handleChange}  autoComplete="off" /></td>
            <td><label for="gender"><h6 class="h1">Gender:</h6></label>&nbsp;&nbsp;&nbsp;
                <input id="gender" name='gender'  value={pdata.Gender} type='text' onChange={handleChange}   autoComplete="off"/></td>
            </tr>
            <tr>
            <td><label for="nat"><h6 class="h1">Nationality:</h6></label>&nbsp;&nbsp;&nbsp;
                <input id="nat" name='nat'  value={pdata.Nationality} type='text' onChange={handleChange}  autoComplete="off"/></td>
            <td><label for="dob"><h6 class="h1">Date of birth:</h6></label>&nbsp;&nbsp;&nbsp;
                <input id="dob" name='dob'  value={pdata.DOB} type='text' onChange={handleChange}  autoComplete="off"/></td>
            <td><input type="file" name="file" onClick={uploadHandler}/></td>
            <td><Button variant="primary" type="submit" onClick={handleSubmit}>Upload</Button>{' '}</td>

            </tr>
          </table>
  
          
          
        </div>
        
        </div>}
        
        

      </div>
      
    </div >
  );
}


export default App;

