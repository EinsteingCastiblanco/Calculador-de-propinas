let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente );

function guardarCliente() {
    const mesa = document.querySelector('#mesa').value,
        hora = document.querySelector('#hora').value;

    //* revisar si hay campos vacios
    //? el some es un metodo de arreglos que verifica que almenos un campo cumpla con la condicion
    const camposVacios = [mesa, hora ].some( campo => campo === "");
    if(camposVacios){

        const existe = document.querySelector('.invalid-feedback');

        //* si no exite la clase se manda a imprimir el error
        if(!existe){
            const alerta = document.createElement('div');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alerta);

            //eliminar alerta luego de 3 segundos
            setTimeout(()=> {
                alerta.remove();
            },3000);
        }

        return;
   
    }
    //? asigna los datos del formulario a cliente
    cliente = {...cliente, mesa, hora};

    //? ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    //mostrar secciones
    mostrarSecciones();

    //obtener platillos de la API de JSON-SERVER
    obtenerPlatillos();

}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    //recorre todos los objetos que tengan un clase "d-none" y las elemina
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos() {
    const url = 'http://localhost:3000/platillos';

    fetch(url)
        .then( respuesta => respuesta.json() )
        .then( respuesta => mostrarPlatillos(respuesta))
        .catch( error => console.log(error) );
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {
        const row = document.createElement('div');
        row.classList.add('row');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `${platillo.precio}`;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[ platillo.categoria ];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        //? funcion que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = function() {
            const cantidad = parseInt( inputCantidad.value );
            //? crea un nuevo objeto y le agrega los valores del objeto platillo y le agrega cantidad
            agregarPlatillo( { ...platillo, cantidad } );
        };

        const agregar = document.createElement('div');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);
        
        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    })
}

function agregarPlatillo(producto) {
    //* Extraer pedido del objeto cliente
    let { pedido } = cliente;

    //* revisar si la cantidad es mayor a 0
    if( producto.cantidad > 0 ){
        //? itera sobre el objeto y dependiendo si cumple la condicion retorna true o false
       
        //comprueba su el elemento ya existe en el arreglo
        if(pedido.some( articulo => articulo.id === producto.id ) ){

            //el articulo ya exite actualiza la cantidad
            const pedidoActualizado = pedido.map( articulo => {
                if(articulo.id === producto.id ){
                    //actualiza la cantidad con el valor del input que recoje la cantidad
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            //se asigna el nuevo arreglo al cliente.pedido
            cliente.pedido = [...pedidoActualizado ];
        }else{
            //el articulo no exite se agrega al arreglo del pedido
            cliente.pedido = [...pedido, producto];
        }

    }else {
        //eliminar elementos cuando la cantidad sea 0
        // el filter crea un nuevo arreglo con todos los elementos que cumplan la condicion
        const resultado = pedido.filter( articulo => articulo.id !== producto.id );
        cliente.pedido = [...resultado];
    }
    
    //limpiar el contenido previo
    limpiarHTML();

    //si el arreglo tiene algo manda a llamar la funcion de actualizarResumen
    if( cliente.pedido.length ){
        //mostrar resumen
        actualizarResumen();
    }else{
       mensajePedidoVacio(); 
    }

}

function actualizarResumen() {
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-5','px-3', 'shadow' );

    //informacion de la mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //informacion de la hora
    const hora = document.createElement('p');
    hora.textContent = 'Hora';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //agregar a los elementos padre
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //titulo de la seccion 
    const heading = document.createElement('h3')
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');


    //iterar sobre el arreglo de pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id } = articulo;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = 'Nombre';

        const cantidadEl = document.createElement('p');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //precio del articulo
        const precioEl = document.createElement('p');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        //subtotal del articulo
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal';
        
        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal( precio, cantidad );

        //boton eliminar 
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn','btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';

        //funcion para eliminar del pedido
        btnEliminar.onclick = function() {
            eliminarProducto(id);
        };
        //agregar valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        grupo.appendChild(lista);

    })
    //agregar al contenido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);
    
    contenido.appendChild(resumen);

    //* mostrar formulario de propinas
    formularioPopinas();
}

function limpiarHTML() {
    const contenido = document.querySelector('#resumen .contenido');

    while( contenido.firstChild ){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad) {
 return `$${precio * cantidad}`;
}

function eliminarProducto(id) {
    const { pedido } = cliente;

    const resultado = pedido.filter( articulo => articulo.id !== id );
    cliente.pedido = [...resultado];

    limpiarHTML();

    //si el arreglo tiene algo manda a llamar la funcion de actualizarResumen
    if( cliente.pedido.length ){
        //mostrar resumen
        actualizarResumen();
    }else{
       mensajePedidoVacio(); 
    }

    //cuando el producto se elimine regresamos la cantidad a o en el input
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio() {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);

}

function formularioPopinas() {
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('div');
    divFormulario.classList.add('card', 'px-3', 'shadow');


    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    //radio button 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //radio button 25%
    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('label');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    //radio button 50%
    const radio50 = document.createElement('input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('label');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('div');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);
    formulario.appendChild(divFormulario);

    contenido.appendChild(formulario);
}

function calcularPropina() {
    
    const { pedido } = cliente;
    let subtotal= 0;    

    // calcular subtotal a pagar
    pedido.forEach(articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    //selecciona el radio button con la propina del cliente
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //calcular propina
    const propina = ((subtotal * parseInt( propinaSeleccionada)) / 100 );

    //calcular total a pagar 
    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina);
}


function mostrarTotalHTML( subtotal, total, propina ) {
    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar','my-5');

    // subtotal
    const subTotalParrafo = document.createElement('p');
    subTotalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    subTotalParrafo.textContent = 'Subtotal Consumo';

    const subtotalSpan = document.createElement('span');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent =  subtotal;

    subTotalParrafo.appendChild(subtotalSpan);


    // propina
    const propinaParrafo = document.createElement('p');
    propinaParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    propinaParrafo.textContent = 'Propina';

    const propinaSpan = document.createElement('span');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent =  propina;

    propinaParrafo.appendChild(propinaSpan);


    // total
    const totalParrafo = document.createElement('p');
    totalParrafo.classList.add('fs-4', 'fw-bold', 'mt-2');
    totalParrafo.textContent = 'Total a Pagar';

    const totalSpan = document.createElement('span');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent =  total;

    totalParrafo.appendChild(totalSpan);

    //eliminar ultimo resultado 
    const totalPagarDiv = document.querySelector('total-pagar');
    if(totalPagarDiv){
        totalPagarDiv.remove();
    }

    divTotales.appendChild(subTotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);


    const formualrio = document.querySelector('.formulario > div');
    formualrio.appendChild(divTotales);
}