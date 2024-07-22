import 'bootstrap/dist/css/bootstrap.min.css'
import logo from './components/images/logo2015_2.png';
// import './App.css';
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import { InputStorm } from './features/storm/inputStorm';

function App() {
  const url = window.location.href
  const postCode = (url.indexOf('postCode')>-1)? url.slice(-5) : '99999'
  return (
    <div className="App">
      <Navbar bg='primary' data-bs-theme='dark' expand='lg'>
        <Container>
          <Navbar.Brand href='#home'>
            <img src={logo} width={50} height={50} alt='UGMS logo'/>{' '}
            Гидрометцентр ДНР
          </Navbar.Brand>
        </Container>
      </Navbar>
      <InputStorm postCode={postCode} />
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
