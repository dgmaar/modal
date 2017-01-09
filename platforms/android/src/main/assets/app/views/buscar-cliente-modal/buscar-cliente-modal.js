var application = require("application");
var appSettings = require("application-settings");
var frameModule = require("ui/frame");
var dialogs = require("ui/dialogs");
var observableArray = require("data/observable-array");
var listViewModule = require("ui/list-view");
var observableModule = require("data/observable");
var platform = require("platform");
var page, data, loading = new observableModule.Observable();
//var ApiClient = require('nativescript-apiclient');
var ImageModule = require("ui/image");
var utilsModule = require("utils/utils");
//var openUrl = require("nativescript-openurl");
var jsonObj, json;
var client;
var arreglo;
var arrayImagenes, objArt, indexItemSwiped;
//Views
var txtBuscarArt, lblProducto, lista, lblPrecio, lblCantidad, imgArt, maxPag, pag,valBus, imgLimpiar, desde;

if(application.android)
    var Toast = android.widget.Toast;

function loadPage(args) 
{
    page = args.object;
    minWHDPIs();
    console.log("//////////// DESDE: "+desde);
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
    }
    //Inicializar componentes
    txtBuscarArt = page.getViewById("txtBuscarArt");
    
    /*loading = new observableModule.Observable({
        isLoading: false
    });
    ocupado = new observableModule.Observable({
        valOcupado: false
    });
    indicator = page.getViewById("indicator");
    indicator.bindingContext = loading;*/

    if(application.ios)
        arreglo = [];
    else   
        arreglo = new observableArray.ObservableArray();
    page.bindingContext = {myItems: arreglo};
    lista = page.getViewById("listaCotiz");
   // buscarCliente();
    page.bindingContext = {myItems: arreglo};
}
exports.loadPage = loadPage;

var closeCallback;
function onShownModally(args) {
    context = args.context;
    closeCallback = args.closeCallback;
}
exports.onShownModally = onShownModally;

function aceptar(args) {
    var cliId, nombre;
    if(application.ios)
    {
        cliId = arreglo[args.itemIndex].noCliente;
        nombre = arreglo[args.itemIndex].cliente;
    }
    else
    {

    }
    closeCallback(cliId, nombre);
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

function closeClonar(idCliente)
{
    console.log("IDCliente: "+idCliente);
    var ver= {
        moduleName: "views/abrir/ver-cotizacion/clonar/clonar",
        context:{idCliente: idCliente},
        animates: false,
        clearHistory: true
    };
    var topmost = frameModule.topmost();
    topmost.navigate(ver);
}
exports.closeClonar = closeClonar;

function close()
{
    if(application.android)
        gc();
    var frameModule = require("ui/frame");
    if(desde == 'verCoti')
    {
        var ver= {
            moduleName: "views/abrir/ver-cotizacion/ver-cotizacion",
            context:{cotId: data.cotId},
            animates: false,
            clearHistory: true
        };
        var topmost = frameModule.topmost();
        topmost.navigate(ver);
    }
    else
    {
        var ver= {
            moduleName: "views/menuprin/menuprin",
            animates: false,
            clearHistory: true
        };
        var topmost = frameModule.topmost();
        topmost.navigate(ver);
    }
}
exports.close = close;

function agregarItems(value, index) {
    //console.log("en agregar items");
    //console.log("coti, total: "+value.cliId+" "+value.nombre+" "+value.precio);
    //agregar a arreglo observable
    arreglo.push({noCliente: value.cliId, cliente:value.nombre, val:value.precio, index:((pag-1)*20)+index, telefono:value.telefono});
    //console.log("tel: "+((pag-1)*20+index));
}
exports.agregarItems = agregarItems;

function cambiarCliente(args)
{
    if(desde == 'verCoti')
    {
        var index = args.itemIndex;
        var idCliente;
        if(application.ios)
            idCliente = arreglo[index].noCliente;
        else   
            idCliente = arreglo.getItem(index).noCliente;
        console.log("NoCliente: "+idCliente+"cotID: "+data.cotId);

        client = ApiClient.newClient({
                baseUrl: "http://"+appSettings.getString("ip")+":8181/rest/cotizador/cambiarCliente",
            });

            client.get({
                params: {
                    cotId:data.cotId,
                    cliId:idCliente
                }
            });

            client.ok(function (result) {
                close();
            })
            .error(function (ctx) 
            {
                // Error en conexión
                if(application.android)
                    Toast.makeText(application.android.context, "Se perdió la conexión con el servidor", Toast.LENGTH_LONG).show();   
                if(application.ios)
                {
                    dialogs.alert({title: "Error",
                    message: "Se perdió la conexión con el servidor",
                    okButtonText: "OK"}).then(function() {
                    //console.log("Dialog closed!");
                    });
                }  
                //loading.set("isLoading", false);           
            });
    }
    else if(desde == 'clonar')
    {
        var index = args.itemIndex;
        var idCliente;
        if(application.ios)
            idCliente = arreglo[index].noCliente;
        else   
            idCliente = arreglo.getItem(index).noCliente;
        closeClonar(idCliente);
    }
}
exports.cambiarCliente = cambiarCliente;


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
                    ".textItemList { font-size:14; }"+
                    ".lblAbr { font-size:10; }"+
                    ".textItemSwipe { font-size:12; }"+
                    ".textActBar { font-size: 16; }"+
                    ".buttonAgr { font-size: 12; }"+
                    ".tfVariosArt { font-size:16; }");
    }
    else
    if(minDPIs >= 480 && minDPIs < 600)
    {
        page.addCss(".textGris { font-size:20; }"+
                    ".textItemList { font-size:18; }"+
                    ".lblAbr { font-size:14; }"+
                    ".textItemSwipe { font-size:16; }"+
                    ".textActBar { font-size: 22; }"+
                    ".buttonAgr { font-size: 18; }"+
                    ".tfVariosArt { font-size: 20; }");
    }
    else
    if(minDPIs >= 600 && minDPIs < 720)
    {
        page.addCss(".textGris { font-size:24; }"+
                    ".textItemList { font-size:22; }"+
                    ".lblAbr { font-size:18; }"+
                    ".textItemSwipe { font-size:20; }"+
                    ".textActBar { font-size: 28; }"+
                    ".buttonAgr { font-size: 24; }"+
                    ".tfVariosArt { font-size: 24; }");
    }
    else
    if(minDPIs >= 720)
    {
         page.addCss(".textGris { font-size:34; }"+
                    ".textItemList { font-size:32; }"+
                    ".lblAbr { font-size:28; }"+
                    ".textItemSwipe { font-size:30; }"+
                    ".textActBar { font-size: 38; }"+
                    ".buttonAgr { font-size: 34; }"+
                    ".tfVariosArt { font-size: 34; }");
    }
}
exports.resizeFontSizeByScreenRes = resizeFontSizeByScreenRes;

function onSwipeCellStarted(args) 
{
    var swipeLimits = args.data.swipeLimits;
    var listView = frameModule.topmost().currentPage.getViewById("listaCotiz");
    
    swipeLimits.threshold = 60 * utilsModule.layout.getDisplayDensity();
    swipeLimits.left = 0;
    swipeLimits.right = listView.getMeasuredWidth()/4;

    indexItemSwiped = args.itemIndex;
    console.log("ItemSwiped: "+indexItemSwiped);
}     
exports.onSwipeCellStarted = onSwipeCellStarted;

