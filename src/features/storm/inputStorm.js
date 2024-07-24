import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Accordion from 'react-bootstrap/Accordion'
import { icePhenomena, waterBodies } from '../../components/dictionaries'
import { useSaveHydroStormQuery } from '../api/apiSlice'

const ipChar = new Array(5).fill(null)
const ipAddon = new Array(5).fill(null)
const wbChar = new Array(5).fill(null)
const wbAddon = new Array(5).fill(null)
let showResponse = false

export const InputStorm = ({postCode})=>{
  const [hydroData, setHydroData] = useState(null)
  const {
    data: response = {},
    isSuccess,
  } = useSaveHydroStormQuery(hydroData)
  let today = new Date()
  const [obsDate, setObsDate] = useState(today.toISOString().slice(0,10))
  let currDay = obsDate.slice(8,10)
  const [obsHour, setObsHour] = useState('00')
  const [key, setKey] = useState('01')
  const [waterLevel, setWaterLevel] = useState(null)
  const [waterLevelDeviation, setWaterLevelDeviation] = useState(null)
  const hydroPostCode = postCode
  //                                        01234   56789        0  12        34      56789  01  2345678901234
  const [telegram, setTelegram] = useState(`HHZZ ${hydroPostCode} ${currDay}${obsHour}7 977${key} 10000 20000=`)
  const [activeKeys, setActiveKeys] = useState(["0"]);
  const handleSelect = (eventKey) => setActiveKeys(eventKey);
  const myReset = ()=>{
    setWaterLevel(0)
    setWaterLevelDeviation(0)
    setKey('01')
    setActiveKeys([])
    setTelegram(`HHZZ ${hydroPostCode} ${currDay}${obsHour}7 977${key} 10000 20000=`)
  }
  const {handleSubmit, reset} = useForm({})
  const onSubmit=()=>{
    let hydroData={
      telegram,
      hydroPostCode,
      obsDate,
      obsHour,
      phenomenonType: key,
    }
    if(waterLevel!==null)
      hydroData['waterLevel']=waterLevel
    if(waterLevelDeviation!==null)
      hydroData['waterLevelDeviation']=waterLevelDeviation
    if(ipChar[0]!==null){
      for (let i = 0; i < 5; i++) {
        if(ipChar[i]!==null){
          hydroData = {...hydroData,[`ip${i*2}`]:ipChar[i]}
          if(ipAddon[i]>10){ // character
            if(ipAddon[i]!==ipChar[i])
              hydroData = {...hydroData,[`ip${i*2+1}`]:ipAddon[i]}
          }else //intense
            hydroData = {...hydroData,[`ii${i*2+1}`]:ipAddon[i]}
        }
      }
    }
    if(wbChar[0]!==null){
      for (let i = 0; i < 5; i++) {
        if(wbChar[i]!==null){
          hydroData = {...hydroData,[`wb${i*2}`]:wbChar[i]}
          if(wbAddon[i]>10){
            if(wbAddon[i]!==wbChar[i])
              hydroData = {...hydroData,[`wb${i*2+1}`]:wbAddon[i]}
          }else
            hydroData = {...hydroData,[`wi${i*2+1}`]:wbAddon[i]}
        }
      }
    }
    if(precipitation!==null)
      hydroData['precipitation']=precipitation
    if(durationPrecipitation!==null)
      hydroData["durationPrecipitation"]=durationPrecipitation
    setHydroData(hydroData)
    showResponse = true
    myReset()
  }
  const dateChanged=e=>{
    let od = e.target.value
    setObsDate(od)
    let newText = telegram.slice(0,11)+od.slice(8,10)+telegram.slice(13)
    setTelegram(newText)
  }
  const obsHourChanged=e=>{
    let oh = e.target.value
    setObsHour(oh)
    oh = +oh>9? oh : '0'+oh
    let newText = telegram.slice(0,13)+oh+telegram.slice(15)
    setTelegram(newText)
  }
  const keyChanged=k=>{
    setActiveKeys([])
    setKey(k)
    let newText = telegram.slice(0,20)+k+telegram.slice(22)
    switch (k) {
      case '01':
      case '02':
        setDurationPrecipitation(null)
        setPrecipitation(null)
        setWaterLevel(0)
        setWaterLevelDeviation(0)
        newText = newText.slice(0,22)+' 10000 20000='
        break;
      case '05':
        ipChar[0]=ipAddon[0]=wbChar[0]=wbAddon[0]=null
        setWaterLevel(null)
        setWaterLevelDeviation(null)
        newText = newText.slice(0,22)+' 00000='
        break
      default:
        break;
    }
    setTelegram(newText)
  }
  const wlDeviationJsx=(id,wld)=>{
    return(<Form.Group className="mb-3" >
      <Form.Label>Изменение уровня воды в сантиметрах (Группа 2)</Form.Label>
      <Form.Control id={id} type="number" value={wld} onChange={waterLevelDeviationChanged} min="-999" max="999" pattern="^-?[0-9]{1,3}$"/>
    </Form.Group>)
  }
  const waterLevelDeviationChanged = (e)=>{
    let wld = e.target.value 
    if(!/^-?[0-9]{1,3}$/.test(e.target.value))
      wld = '0'
    let g2 = +wld === 0 ? '0000' : (+wld>0 ? (wld.toString().padStart(3,'0')+'1') : (Math.abs(+wld).toString().padStart(3,'0')+'2'))
    let newText = telegram
    switch (e.target.id) {
      case "wld01":
        setWaterLevelDeviation(wld)
        newText = telegram.slice(0,30)+g2+telegram.slice(34)   
        break;
    }
    setTelegram(newText)
  }
  const waterLevelJsx = (id, wl)=>{
    return (<Form.Group className="mb-3" >
      <Form.Label>Уровень воды над нулем поста в сантиметрах (Группа 1)</Form.Label>
      <Form.Control id={id} type="number" value={wl} onChange={waterLevelChanged} min="-999" max="4999" pattern="^-?[0-9]{1,4}$"/>
    </Form.Group>)
  }
  const waterLevelChanged = (e)=>{
    let wl = e.target.value
    if(/^-?[0-9]{1,4}$/.test(wl)){
      wl = +wl>4999 ? 4999 : wl
      wl = +wl<-999 ? -999 : wl
    }else
      wl = 0
    let g1 = +wl >= 0 ? wl.toString().padStart(4,'0') : (5000+Math.abs(+wl)).toString()      
    let newText = telegram
    switch (e.target.id) {
      case 'wl01':
        setWaterLevel(wl)
        newText = telegram.slice(0,24)+`${g1}`+telegram.slice(28)   
        break;
    }
    setTelegram(newText)
  }
  //group5
  const combineG5=()=>{
    let ret = ''
    for (let i = 0; i < ipChar.length; i++){
      ret += ipChar[i]===null? '':` 5${ipChar[i]}${ipAddon[i]}`
    }
    return ret
  }
  const newG5 = k=>{
    let start151 = telegram.indexOf(' 5')
    let allG5 = combineG5()
    return telegram.slice(0,start151)+combineG5()+telegram.slice(start151+allG5.length+k*6)
  }
  const showGroup15=()=>{
    ipChar[0] = 11
    ipAddon[0] = '01'
    let g152 = ipChar[1]===null?'':` 5${ipChar[1]}${ipAddon[1]}`
    let g153 = ipChar[2]===null?'':` 5${ipChar[2]}${ipAddon[2]}`
    let g154 = ipChar[3]===null?'':` 5${ipChar[3]}${ipAddon[3]}`
    let g155 = ipChar[4]===null?'':` 5${ipChar[4]}${ipAddon[4]}`
    let g5 = ` 51101${g152}${g153}${g154}${g155}`
    let start15 = 34
    let newText = telegram.slice(0,start15)+g5+telegram.slice(start15)
    setTelegram(newText)
  }
  const hideGroup15=()=>{
    ipChar[0] = ipAddon[0] = null
    let newText = telegram.replace(/ 5..../g,'')
    setTelegram(newText)
  }
  const group5Jsx=(id,ipChange,iiChange)=>{
    return(<Form.Group className="mb-3" >
      <Form.Label>Выберите характеристику явления</Form.Label>
      <Form.Select id={id+'ip'} onChange={ipChange} menuPortalTarget={document.body}>
        {Object.keys(icePhenomena).map(ip => {if(+ip>10) return <option value={ip}>{icePhenomena[ip]}</option>})}
      </Form.Select>
      <Form.Label>Выберите характеристику или интенсивность явления</Form.Label>
      <Form.Select id={id+'ipi'} onChange={iiChange}>
        {Object.keys(icePhenomena).map(ip => <option value={ip}>{icePhenomena[ip]}</option>)}
      </Form.Select>
    </Form.Group>)
  }
  const ipCodeChanged = e=>{
    let ip = e.target.value
    let i = +e.target.id[4] //t1g51
    ipChar[i-1] = ip
    setTelegram(newG5(0))
  }
  const iiCodeChanged = e=>{
    let ii = +e.target.value>9? e.target.value : '0'+e.target.value
    let i = +e.target.id[4] //t1g51
    ipAddon[i-1] = ii
    setTelegram(newG5(0))
  }
  const showGroup152=()=>{
    ipChar[1] = 11
    ipAddon[1] = '01'
    setTelegram(newG5(-1))
  }
  const hideGroup152=()=>{
    ipChar[1] = ipAddon[1] = null
    setTelegram(newG5(1))
  }
  const showGroup153=()=>{
    ipChar[2] = 11
    ipAddon[2] = '01'
    setTelegram(newG5(-1))
  }
  const hideGroup153=()=>{
    ipChar[2] = ipAddon[2] = null
    setTelegram(newG5(1))
  }
  const showGroup154=()=>{
    ipChar[3] = 11
    ipAddon[3] = '01'
    setTelegram(newG5(-1))
  }
  const hideGroup154=()=>{
    ipChar[3] = ipAddon[3] = null
    setTelegram(newG5(1))
  }
  const showGroup155=()=>{
    ipChar[4] = 11
    ipAddon[4] = '01'
    setTelegram(newG5(-1))
  }
  const hideGroup155=()=>{
    ipChar[4] = ipAddon[4] = null
    setTelegram(newG5(1))
  }
  //group6
  const combineG6=()=>{
    let ret = ''
    for (let i = 0; i < wbChar.length; i++){
      ret += wbChar[i]===null? '':` 6${wbChar[i]}${wbAddon[i]}`
    }
    return ret
  }
  const changeG6=(k)=>{
    let allG6 = combineG6()
    let start16 = telegram.indexOf(' 6')
    return telegram.slice(0,start16)+allG6+telegram.slice(start16+allG6.length+k*6)
  }
  const showGroup16=()=>{
    wbChar[0] = '00'
    wbAddon[0] = '00'
    let g162 = wbChar[1]===null?'':` 6${wbChar[1]}${wbAddon[1]}`
    let g163 = wbChar[2]===null?'':` 6${wbChar[2]}${wbAddon[2]}`
    let g164 = wbChar[3]===null?'':` 6${wbChar[3]}${wbAddon[3]}`
    let g165 = wbChar[4]===null?'':` 6${wbChar[4]}${wbAddon[4]}`
    let g6 = ` 60000${g162}${g163}${g164}${g165}`
    let start16 = 34 + combineG5().length
    let newText = telegram.slice(0,start16)+g6+telegram.slice(start16)
    setTelegram(newText)
  }
  const hideGroup16=()=>{
    wbChar[0] = wbAddon[0] = null
    let newText = telegram.replace(/ 6..../g,'')
    setTelegram(newText)
  }
  const group6Jsx = (id,wbChange,wbiChange)=>{
    return(<Form.Group className="mb-3" >
      <Form.Label>Выберите характеристику объекта</Form.Label>
      <Form.Select id={id+'wb'} onChange={wbChange} >
        {Object.keys(waterBodies).map(wb => {if(+wb===0 || +wb>10) return <option value={wb}>{waterBodies[wb]}</option>})}
      </Form.Select>
      <Form.Label>Выберите характеристику объекта или интенсивность явления</Form.Label>
      <Form.Select id={id+'wbi'} onChange={wbiChange}>
        {Object.keys(waterBodies).map(wb => <option value={wb}>{waterBodies[wb]}</option>)}
      </Form.Select>
    </Form.Group>)
  }
  const wb1CodeChanged = e=>{
    let wb = +e.target.value>9? e.target.value : '0'+e.target.value
    let i = +e.target.id[4]-1 // 't1g61wb'
    wbChar[i] = wb
    setTelegram(changeG6(0))
  }
  const wbi1CodeChanged = e=>{
    let wbi = +e.target.value>9? e.target.value : '0'+e.target.value
    let i = +e.target.id[4]-1 // 't1g61'
    wbAddon[i] = wbi
    setTelegram(changeG6(0))
  }
  const showGroup162=()=>{
    wbChar[1]=wbAddon[1] = '00'
    setTelegram(changeG6(-1))
  }
  const hideGroup162=()=>{
    wbChar[1] = wbAddon[1] = null
    setTelegram(changeG6(1))
  }
  const showGroup163=()=>{
    wbChar[2]=wbAddon[2] = '00'
    setTelegram(changeG6(-1)) //'show'))
  }
  const hideGroup163=()=>{
    wbChar[2]=wbAddon[2] = null
    setTelegram(changeG6(1)) //'hide'))
  }
  const showGroup164=()=>{
    wbChar[3]=wbAddon[3]='00'
    setTelegram(changeG6(-1)) //'show'))
  }
  const hideGroup164=()=>{
    wbChar[3]=ipAddon[3]= null
    setTelegram(changeG6(1)) //'hide'))
  }
  const showGroup165=()=>{
    wbChar[4]=wbAddon[4] = '00'
    setTelegram(changeG6(-1)) //'show'))
  }
  const hideGroup165=()=>{
    wbChar[4]=ipAddon[4] = null
    setTelegram(changeG6(1)) //'hide'))
  }
  const group5 = <Accordion alwaysOpen activeKey={activeKeys}  onSelect={handleSelect}>
    <Accordion.Item eventKey="2">
      <Accordion.Header>Ледовые явления (Группа 5)</Accordion.Header>
      <Accordion.Body onEnter={showGroup15} onExited={hideGroup15}>
        {group5Jsx('t1g51',ipCodeChanged,iiCodeChanged)}
        <Accordion alwaysOpen activeKey={activeKeys}  onSelect={handleSelect}>
          <Accordion.Item eventKey="3" id="accordion-ip2" >
            <Accordion.Header>Экземпляр 2</Accordion.Header>
            <Accordion.Body onEnter={showGroup152} onExited={hideGroup152}>
              {group5Jsx('t1g52',ipCodeChanged,iiCodeChanged)}
              <Accordion>
                <Accordion.Item eventKey="4">
                  <Accordion.Header>Экземпляр 3</Accordion.Header>
                  <Accordion.Body onEnter={showGroup153} onExited={hideGroup153}>
                    {group5Jsx('t1g53',ipCodeChanged,iiCodeChanged)}
                    <Accordion>
                      <Accordion.Item eventKey="5">
                        <Accordion.Header>Экземпляр 4</Accordion.Header>
                        <Accordion.Body onEnter={showGroup154} onExited={hideGroup154}>
                          {group5Jsx('t1g54',ipCodeChanged,iiCodeChanged)}
                          <Accordion>
                            <Accordion.Item eventKey="6">
                              <Accordion.Header>Экземпляр 5</Accordion.Header>
                              <Accordion.Body onEnter={showGroup155} onExited={hideGroup155}>
                                {group5Jsx('t1g55',ipCodeChanged,iiCodeChanged)}
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
  const group6 = <Accordion alwaysOpen activeKey={activeKeys}  onSelect={handleSelect}>
    <Accordion.Item eventKey="7">
      <Accordion.Header>Состояние водного объекта (Группа 6)</Accordion.Header>
      <Accordion.Body onEnter={showGroup16} onExited={hideGroup16}>
        {group6Jsx('t1g61',wb1CodeChanged,wbi1CodeChanged)}
        <Accordion>
          <Accordion.Item eventKey="8">
            <Accordion.Header>Экземпляр 2</Accordion.Header>
            <Accordion.Body onEnter={showGroup162} onExited={hideGroup162}>
              {group6Jsx('t1g62',wb1CodeChanged,wbi1CodeChanged)}
              <Accordion>
                <Accordion.Item eventKey="9">
                  <Accordion.Header>Экземпляр 3</Accordion.Header>
                  <Accordion.Body onEnter={showGroup163} onExited={hideGroup163}>
                    {group6Jsx('t1g63',wb1CodeChanged,wbi1CodeChanged)}
                    <Accordion>
                      <Accordion.Item eventKey="10">
                        <Accordion.Header>Экземпляр 4</Accordion.Header>
                        <Accordion.Body onEnter={showGroup164} onExited={hideGroup164}>
                          {group6Jsx('t1g64',wb1CodeChanged,wbi1CodeChanged)}
                          <Accordion>
                            <Accordion.Item eventKey="11">
                              <Accordion.Header>Экземпляр 5</Accordion.Header>
                              <Accordion.Body onEnter={showGroup165} onExited={hideGroup165}>
                                {group6Jsx('t1g65',wb1CodeChanged,wbi1CodeChanged)}
                              </Accordion.Body>
                            </Accordion.Item>
                          </Accordion>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>

  // group10
  const [precipitation, setPrecipitation] = useState(null)
  const [durationPrecipitation, setDurationPrecipitation] = useState(null)
  
  const precipitationChanged=e=>{
    let p=e.target.value
    if(!/^[0-9]{1,3}$/.test(p))
      p=0
    setPrecipitation(p)
    let start10 =  22
    let newText = telegram.slice(0,start10+2)+(+p).toString().padStart(3,'0')+telegram.slice(start10+5)    
    setTelegram(newText)
  }
  const durationPrecipitationChanged=e=>{
    let dp = e.target.value
    if(!/^0?[0-4]$/.test(dp))
      dp=0
    let newText = telegram
        setDurationPrecipitation(+dp)
        let start10 = 22
        newText = telegram.slice(0,start10+5)+(+dp).toString()+telegram.slice(start10+6)
        setTelegram(newText)
  }
  const myForm=<Form onSubmit={handleSubmit(onSubmit)} onReset={reset}>
    <Form.Group className='mb-3'>
      <Form.Label>Дата наблюдения</Form.Label>
      <Form.Control type='date' value={obsDate} onChange={dateChanged} />
    </Form.Group>
    <Form.Group className='mb-3'>
      <Form.Label>Срок наблюдения</Form.Label>
      <Form.Control type='number' value={obsHour} onChange={obsHourChanged} min='0' max='23' pattern='^[0-9]{1,2}$' />
    </Form.Group>
    <Tabs defaultActiveKey='01' id='01' className='mb-3' activeKey={key} onSelect={keyChanged}>
      <Tab eventKey='01' title='01'>
        <p>Сведения о высоких уровнях</p>
        {waterLevelJsx('wl01',waterLevel)}
        {wlDeviationJsx('wld01',waterLevelDeviation)}
        {group5}
        {group6}
      </Tab>
      <Tab eventKey='02' title='02'>
        <p>Сведения о низких уровнях</p>
        {waterLevelJsx('wl01',waterLevel)}
        {wlDeviationJsx('wld01',waterLevelDeviation)}
        {group5}
        {group6}
      </Tab>
      <Tab eventKey='05' title='05'>
        <p>Сведения о сильном дожде</p>
        <Form.Group className="mb-3" >
          <Form.Label>Количество осадков (цифры кода)</Form.Label>
          <Form.Control id='t5p' type="number" value={precipitation} onChange={precipitationChanged} min="0" max="999" pattern='[0-9]{1,3}'/>
        </Form.Group>
        <Form.Group className="mb-3" >
          <Form.Label>Продолжительность выпадения осадков (цифра кода)</Form.Label>
          <Form.Control id='t5dp' type="number" value={durationPrecipitation} onChange={durationPrecipitationChanged} min="0" max="4"  pattern='^0?[0-4]$'/>
        </Form.Group>
      </Tab>
    </Tabs>
    <Button variant='primary' type='submit'>Сохранить</Button>
  </Form>

  let content = <div>
    <p>{telegram}</p>
    {myForm}
  </div>
  if(showResponse && isSuccess && response.response){ // .failed_count==="0") && (response.response.success_count !== '0')){
    let csdnSection1 = response.response.response.failed_count==='0'? 'В ЦСДН сохранены данные.':'Ошибка при сохранении данных.'
    // let csdnSection6 = !!(response.response.response_water_consumption && (response.response.response_water_consumption.failed_count==='0'))?'В ЦСДН сохранены данные раздела 6':'Ошибка при сохранении данных раздела 6'
    let localDB = response.response.message ? `${response.response.message}` : ''
    alert(`${csdnSection1} ${localDB}`)
    showResponse = false
  }else{
    console.log("Не удалось сохранить данные")
    // alert("Не удалось сохранить данные")
    // showResponse = false
  } 
  return(
    <section>
      <h2>Сведения о стихийных гидрологических явлениях</h2>
      {content}
    </section>
  )
}