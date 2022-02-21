import { ContatoDetalheComponent } from './../contato-detalhe/contato-detalhe.component';
import { ContatoService } from './servico/contato.service';
import { Contato } from './model/contato';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario!: FormGroup;
  contatos: Contato[] = [];
  colunas = ['foto','id', 'nome', 'email', 'favorito']

  totalElementos = 0;
  pagina = 0;
  tamanho = 10;
  pageSizeOptions: number[] = [10];

  constructor(
    private contatoService: ContatoService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
    ) { }

  ngOnInit(): void {
   this.montarFormulario();

   this.listContatos(this.pagina, this.tamanho);
  }

  montarFormulario(){
    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required,Validators.email]]
    })
  }
  listContatos(pagina = 0, tamanho = 10){
    this.contatoService.list(pagina, tamanho).subscribe(response => {
      this.contatos = response.content!;
      this.totalElementos = response.totalElements!;
      this.pagina = response.number!;
    })
  }

  favoritar(contato: Contato){
    this.contatoService.favourite(contato).subscribe(resp => {
      contato.favorito = !contato.favorito;
    })
  }

  submit() {
    //const erroNomeRequired = this.formulario.controls.nome.errors;
    //const erroEmailInvalid = this.formulario.controls.email.errors;
    //const isValid = this.formulario.valid;

    const formValues = this.formulario.value;
    const contato: Contato  = new Contato(formValues.nome, formValues.email);
    this.contatoService.save(contato).subscribe(resposta => {
      this.listContatos()
      this.snackBar.open("Contato adicionado!", 'Sucesso!', {
        duration: 2000
      })
      this.formulario.reset();
    })
  }

  uploadFoto(event: any, contato: any){
    const files = event.target.files;
    if(files){
      const foto = files[0];
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.contatoService.upload(contato, formData).subscribe(resp => this.listContatos())
    }
  }

  visualizarContato(contato: Contato){
    this.dialog.open(ContatoDetalheComponent, {
      width: '400px',
      height: '450px',
      data: contato
    })
  }

  paginar(event: PageEvent){
    this.pagina = event.pageIndex;
    this.listContatos(this.pagina, this.tamanho);
  }

}
