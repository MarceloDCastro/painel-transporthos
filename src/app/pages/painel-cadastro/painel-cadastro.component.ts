import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeleteService } from 'src/app/services/delete.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DadosPainelService } from 'src/app/services/dados-painel.service';
import { ClienteIdService } from 'src/app/services/cliente-id.service';
import { ClienteSelecionadoServiceService } from 'src/app/services/cliente-selecionado-service.service';


interface Cliente {
  id: number;
  nome: string;
  email: string;
  // Adicione outros campos do cliente conforme necessário
}

@Component({
  selector: 'app-painel-cadastro',
  templateUrl: './painel-cadastro.component.html',
  styleUrls: ['./painel-cadastro.component.css'],
})
export class PainelCadastroComponent implements OnInit {
  clientes: any[] = [];
  termoDeBusca: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  alternarCores: boolean = true;
  selectedRow: any;
  clienteSelecionado: any;
  mostrarPopupEditar: boolean | undefined;

  constructor(
    private clientesservice: ClientesService,
    private http: HttpClient,
    private deleteService: DeleteService,
    private dadosPainel: DadosPainelService,
    private clienteIdService: ClienteIdService,
    private clienteSelecionadoService: ClienteSelecionadoServiceService
  ) { }

  selecionarLinha(cliente: any) {
    this.selectedRow = cliente;
    this.clienteIdService.setClienteSelecionado(cliente); // Define o cliente selecionado no serviço
    console.log('Cliente Service', this.clienteIdService.getClienteSelecionado()); // Use o método getClienteSelecionado para recuperar o cliente
  }

  abrirPopupEditarCadastro() {
    const url = '/editar';
    const configuracao = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, width=1300, height=350,resizable=no';
    window.open(url, 'EditarPopup', configuracao);
  }




  removerClienteSelecionado() {
    if (this.selectedRow) {
      const idDoCliente = this.selectedRow.id;
      const confirmarExclusao = window.confirm(`Tem certeza de que deseja remover o cliente ${this.selectedRow.cliente} id: ${idDoCliente}?`);

      if (confirmarExclusao) {
        this.deleteService.removerCliente(idDoCliente).subscribe(
          () => {
            console.log('Cliente removido com sucesso');
            window.alert('Cliente removido com sucesso');
            this.carregarClientes();
            this.selectedRow = null;
          },
          (error) => {
            console.error('Erro ao remover cliente', error);
          }
        );
      }
    }
  }

  paginaAlterada(event: any): void {
    this.currentPage = event;
    this.buscarClientes();
  }

  buscarClientes() {
    const params = {
      busca: this.termoDeBusca,
      page: this.currentPage,
      pageSize: this.itemsPerPage,
    };

    this.http
      .get<any[]>('https://transporthos-painel-backend.vercel.app/buscar', { params })
      .subscribe((response) => {
        this.clientes = response;
        this.totalItems = response.length;
        this.alternarCores = !this.alternarCores;
      });
  }

  abrirPopupCadastro() {
    const url = '/cadastro';
    const configuracao = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, width=1300, height=350,resizable=no';
    window.open(url, 'CadastroPopup', configuracao);
  }

  abrirJanelaDoPainel() {
    const token = localStorage.getItem('token');
    const url = `/listagem?token=${token}`;
    window.open(url, '_blank');
  }

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.clientesservice.obterClientes().subscribe(
      (clientes) => {
        this.clientes = clientes;
      },
      (error) => {
        console.error('Erro ao obter a lista de clientes', error);
      }
    );
  }
}
