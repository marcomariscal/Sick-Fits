import App, {Container} from 'next/app'
import Page from '../components/Page'
import Header from '../components/Header'

class MyApp extends App {
   render() {
    const { Component } = this.props
      return (
        <Container>
         <p>Hey I'm on every page!'</p> 
          <Page>
            <Component />
          </Page>
            </Container>
      ) 
   } 
}

export default MyApp
