import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

export const InputStorm = ({postCode})=>{
  let today = new Date()
  const [obsDate, setObsDate] = useState(today.toISOString().slice(0,10))
  let currDay = obsDate.slice(8,10)
  const [obsHour, setObsHour] = useState('00')
  const [key, setKey] = useState('01')
  const [typePhenomenon, setTypePhenomenon] = useState('01')
  const hydroPostCode = postCode
  const [telegram, setTelegram] = useState(`HHZZ ${hydroPostCode} ${currDay}${obsHour}7 977${typePhenomenon}=`)
  const {handleSubmit, reset} = useForm({})
  const onSubmit=()=>{
    let stormData={
      telegram,
      hydroPostCode,
      obsDate,
      obsHour
    }
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
    setKey(k)
    let newText = telegram.slice(0,20)+k+telegram.slice(22)
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
        <p>Сведения о высоких уровнях {key}</p>
      </Tab>
      <Tab eventKey='02' title='02'>
        <p>Сведения о низких уровнях {key}</p>
      </Tab>
    </Tabs>
    <Button variant='primary' type='submit'>Сохранить</Button>
  </Form>

  let content = <div>
    <p>{telegram}</p>
    {myForm}
  </div>
  
  return(
    <section>
      <h2>Сведения о стихийных гидрологических явлениях</h2>
      {content}
    </section>
  )
}