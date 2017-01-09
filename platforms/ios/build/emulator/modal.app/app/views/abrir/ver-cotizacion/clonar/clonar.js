var application = require("application");
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var dialogs = require("ui/dialogs");
var platform = require("platform");
var gestures = require("ui/gestures");
//var ApiClient = require('nativescript-apiclient');
var jsonObj, json;
var client, index;
var page, data, idCliente;
//Views
var txtCotId, txtTotal, txtFecha, txtOldClient, txtNewClient, cont, val = "";

if(application.android)
    var Toast = android.widget.Toast;

function loadPage(args) 
{
    page = args.object;
    minWHDPIs();

    /*txtCotId = page.getViewById("txtIdCot");
    txtTotal = page.getViewById("txtTotal");
    txtFecha = page.getViewById("txtFecha");
    txtOldClient = page.getViewById("txtOldClient");
    txtNewClient = page.getViewById("txtNewClient");*/

    if(application.android)
    {
        gc(); 
        var mi = new android.app.ActivityManager.MemoryInfo();
        var activityManager = application.android.context.getSystemService(android.content.Context.ACTIVITY_SERVICE);
        activityManager.getMemoryInfo(mi);
        var availableMegs = mi.availMem / 1048576;
        console.log("availMem in bytes: " + mi.availMem);

        //Percentage can be calculated for API 16+
        var percentAvail = mi.availMem / mi.totalMem;

        console.log("Percentage usage: " + percentAvail);
        console.log("Available memory (megabytes): " + mi.availMem);
        console.log("Used memory (megabytes): " + mi.totalMem / mi.availMem);
        /*txtCotId.isEnabled = false;
        txtFecha.isEnabled = false;
        txtTotal.isEnabled = false;
        txtOldClient.isEnabled = false;*/
    }
    if(application.ios)
    {
        /*txtCotId.isUserInteractionEnabled = false;
        txtFecha.isUserInteractionEnabled = false;
        txtTotal.isUserInteractionEnabled = false;
        txtOldClient.isUserInteractionEnabled = false;*/
    }
    //if(context != null)















    
   // {
        /*console.log(context.cliente);
        txtCotId.text = context.cotId;
        txtTotal.text = context.total;
        txtFecha.text = context.fecha;
        txtOldClient.text = context.cliente;*/
    //}
}
exports.loadPage = loadPage;

function ocultarTeclado()
{

}
exports.ocultarTeclado = ocultarTeclado;

function buscarCliente()
{
        var modalPageModule = "./views/buscar-cliente-modal/buscar-cliente-modal";
        //var modalPageModule = "views/dialogo/dialogo";
        var context;
        var fullscreen = true;
        //Mandar datos
        //context = { cotId:lblNoCoti.text, total:lblTotal.text, fecha:lblFechaCot.text, cliente: lblCliente.text };

        page.showModal(modalPageModule, '', function closeCallback(cliId, nombre) 
        {
            console.log("en ver-cotizacion **** buscarclientemodal: "+cliId, nombre);
            if(cliId != undefined)
            {
                idCliente = cliId;
                txtNewClient.text = nombre
            }
            //clonarCotizacion();
            //refrescar();
            ocupado.set("valOcupado", false);
        }, fullscreen);
        /*if(application.android)
            gc();
        var frameModule = require("ui/frame");
        var busCliente = {
            moduleName: "views/buscar-cliente/buscar-cliente",
            context: {desde:'clonar'},
            animates: false,
            clearHistory: true
        };
        var topmost = frameModule.topmost();
        topmost.navigate(busCliente);*/
}
exports.buscarCliente = buscarCliente;

var context;
var closeCallback;
function onShownModally(args) {
    context = args.context;
    closeCallback = args.closeCallback;
}
exports.onShownModally = onShownModally;

function aceptar() {
    closeCallback(idCliente);
    idtxtant = "";
    cont = 0;
}
exports.aceptar = aceptar;

function cancelar() {
    closeCallback();
    idtxtant = "";
    cont = 0;
}
exports.cancelar = cancelar;

//Obtener minHeigthDPIs o minWidthDPIs
function minWHDPIs()
{
    var screen = platform.screen;
    var ancho = screen.mainScreen.widthDIPs;
    var altura = screen.mainScreen.heightDIPs;
    if(altura > ancho)
        resizeFontSizeByScreenRes(ancho);
    else
        resizeFontSizeByScreenRes(altura);
} 
exports.minWHDPIs = minWHDPIs;

//Cambiar tamaño de la letra en base a minWHDPIs
function resizeFontSizeByScreenRes(minDPIs)
{
    //console.log("minDPIs: "+minDPIs);
    if(minDPIs >= 320 && minDPIs < 480)
    {
        page.addCss(".textGris { font-size:16; }"+
                    ".buttonLogin { font-size:12; }"+
                    ".tfFechas { font-size:16; }"+
                    ".textItemList { font-size:16; }"+
                    ".textItemSwipe { font-size:12; }"+
                    ".titleDialog { font-size:20; }"+
                    ".tfVariosArt { font-size:16; }");
        page.addCss(".imgArt { width:36; heigth:36; background-color: white;  }");
    }
    else
    if(minDPIs >= 480 && minDPIs < 600)
    {
        page.addCss(".textGris { font-size:20; }"+
                    ".buttonLogin { font-size:16; }"+
                    ".tfFechas { font-size:20; }"+
                    ".textItemList { font-size:20; }"+
                    ".textItemSwipe { font-size:16; }"+
                    ".titleDialog { font-size:24; }"+
                    ".tfVariosArt { font-size: 20; }");
        page.addCss(".imgArt { width:48; heigth:48; background-color: white;  }");
    }
    else
    if(minDPIs >= 600 && minDPIs < 720)
    {
        page.addCss(".textGris { font-size:24; }"+
                    ".buttonLogin { font-size:20; }"+
                    ".tfFechas{ font-size:24; }"+
                    ".textItemList { font-size:24; }"+
                    ".textItemSwipe { font-size:20; }"+
                    ".titleDialog { font-size:28; }"+
                    ".tfVariosArt { font-size: 24; }");
       page.addCss(".imgArt { width:72; heigth:72; background-color: white;  }");
    }
    else
    if(minDPIs >= 720)
    {
         page.addCss(".textGris { font-size:34; }"+
                    ".buttonLogin { font-size:32; }"+
                    ".tfFechas { font-size:34; }"+
                    ".textItemList { font-size:34; }"+
                    ".textItemSwipe { font-size:30; }"+
                    ".titleDialog { font-size:38; }"+
                    ".tfVariosArt { font-size: 34; }");
         page.addCss(".imgArt { width:96; heigth:96; background-color: white;  }");
    }
}
exports.resizeFontSizeByScreenRes = resizeFontSizeByScreenRes;