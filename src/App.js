import React, {Component} from 'react';
import { Table, Container, Header } from 'semantic-ui-react'
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';
import './App.css'

class App extends Component{
  constructor(props){
    super(props)
    this.state = {
      estoque: [],
      historico: []
    }
  }

  componentDidMount = ()=>{
    fetch("estoque.csv")
    .then(file=>file.text())
    .then(file=>{
      //console.log(file)
      file = file.split('\n')
      //console.log(file)
      file = file.map(linha=>linha.split(';'))
      //console.log(file)
      this.setState({estoque: file})
    })

    fetch("historico.csv")
    .then(file=>file.text())
    .then(file=>{
      //console.log(file)
      file = file.split('\n')
      //console.log(file)
      file = file.map(linha=>linha.split(';'))
      //console.log(file)
      this.setState({historico: file})
    })

  }

  getTable = ()=>{
    let estoque = this.state.estoque
    estoque = estoque.map(item=>{
      return(
        <Table.Row>
          <Table.Cell>{item[0]}</Table.Cell>
          <Table.Cell>{item[1]}</Table.Cell>
          <Table.Cell>{item[2]}</Table.Cell>
        </Table.Row>
      )
    })

    return(
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell>Quantidade</Table.HeaderCell>
            <Table.HeaderCell>Preco</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {estoque}
        </Table.Body>
      </Table>
    )
  }

  getHistoricoConteudoTodosProdutos = () => {
    let historico_por_produto = {} // produto => historico dele (vetor de (data, quantidade))
    for(const linha of this.state.estoque)
      historico_por_produto[linha[0]] = []

    for(let linha of this.state.historico)
      if(linha[2].localeCompare('vender') == 1) 
        historico_por_produto[linha[0]].push({data: new Date(linha[1]), quantidade: -1})
      else if(linha[2].localeCompare('inserir') == 1)
        historico_por_produto[linha[0]].push({data: new Date(linha[1]), quantidade: +1})

    let todos_conteudos = {}
    for(const produto of Object.keys(historico_por_produto)){
      let historico_exemplo = historico_por_produto[produto]
    
      let produtos_filtrados = this.state.estoque.filter(item=>item[0] === produto)
      let quantidade_estoque_inicial = 0
      if(produtos_filtrados.length != 0)
        quantidade_estoque_inicial = parseFloat(produtos_filtrados[0][1])

      const data_inicial = new Date("06/08/2019"), data_final = new Date("06/18/2019")
      let conteudo = [], data_aux = new Date(data_inicial), estoque_aux = quantidade_estoque_inicial, historico_data_aux
      while(data_aux.toString() !== data_final.toString()){
        historico_data_aux = historico_exemplo.filter(obj=>obj.data.toString() === data_aux.toString())
        for(const operacao of historico_data_aux)
          estoque_aux += operacao.quantidade
  
        conteudo.push({x:new Date(data_aux), y: parseFloat(estoque_aux)})
        data_aux.setDate(data_aux.getDate()+1)
      }

      todos_conteudos[produto] = conteudo
    }

    return todos_conteudos
  }  

  getHistoricoPorProduto = ()=>{
    let historico = this.getHistoricoConteudoTodosProdutos()
    let graficos = []
    for(const produto of Object.keys(historico)){
      let yRange = {
        min: 0,
        max: Math.max.apply(null, historico[produto].map(linha=>linha.y))
      }
      graficos.push(
        <div>
          {produto}
          <XYPlot
            xType="time"
            width={700}
            height={300}
            yDomain={[yRange.min, yRange.max]}
            yBaseValue={yRange.min}
            >
            <HorizontalGridLines />
            <LineSeries
              data={historico[produto]}/>
            <XAxis />
            <YAxis />
          </XYPlot>
        </div>
      )
    }
    return graficos
  }

  render(){
    let estoque = <div></div>
    let historico = <div></div>
    if(this.state.estoque.length != 0 && this.state.historico.length != 0){
       estoque = this.getTable()
       historico = this.getHistoricoPorProduto()
    }
    return (
      <div>
          <Container  textAlign="center">
            <Header as='h2'>Header</Header>
            {estoque}
            {historico}
          </Container>
      </div>
    );
  }
}

export default App;