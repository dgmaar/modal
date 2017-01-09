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

function agregarCliente()
{
    if(application.android)
        gc();
    var frameModule = require("ui/frame");
    var agregar= {
        moduleName: "views/agregar-cliente/agregar-cliente",
        context:{cotId: data.cotId, desde:desde},
        animates: false,
        clearHistory: true
    };
    var topmost = frameModule.topmost();
    topmost.navigate(agregar);
}
exports.agregarCliente = agregarCliente;

function editarCliente(args)
{
    //console.log("ARGS: "+args);
    var index = args.object.tag;
    console.log("∑∑∑∑∑∑∑∑ INDEX: "+index);
    var id;
    if(application.android)
        id = arreglo.getItem(index).noCliente;
    else
        id = arreglo[index].noCliente;
    //console.log(index+"; - ∑∑∑∑∑∑ INDEX SEL ∑∑∑∑∑: "+arreglo.getItem(index).noCliente);
    if(application.android)
        gc();
    var frameModule = require("ui/frame");
    var editar = {
        moduleName: "views/editar-cliente/editar-cliente",
        context:{cliId: id},
        animates: false,
        clearHistory: true
    };
    var topmost = frameModule.topmost();
    topmost.navigate(editar);
}
exports.editarCliente = editarCliente;

function editar1(args)
{
    var indice;
    console.log("Editar1 : "+args);
    console.log("Index Editar1 : "+args.itemIndex);
    //console.log("Parent ID: "+args.object.parent.parent.id);
    console.log(args.object.parent);
    if(application.android)
        Toast.makeText(application.android.context, "Editar1 : "+args+"Index Editar1 : "+args.itemIndex , Toast.LENGTH_LONG).show(); 
    //editarCliente(args.object.parent);
    //console.log("Index: "+args.object.parent.parent);
}   
exports.editar1 = editar1;

function editar2(args)
{
    var indice;
    console.log("Editar2: "+args);
    //console.log("Parent ID: "+args.object.parent.parent.id);
    console.log(args.object.parent);
    console.log("INDEX: "+parseInt(args.object.tag));
    if(application.android)
        Toast.makeText(application.android.context, "Editar2: "+args+"INDEX Editar2: "+parseInt(args.object.tag) , Toast.LENGTH_SHORT).show();
    
    //editarCliente(args.object.parent);
    //console.log("Index: "+args.object.parent.parent);
}   
exports.editar2 = editar2;

//Buscar clientes
function buscarCliente()
{
    //loading.set("isLoading", true);
    valBus = txtBuscarArt.text;
    client = ApiClient.newClient({
            baseUrl: "http://"+appSettings.getString("ip")+":8181/rest/clientes/buscarCliente",
        });

        client.get({
            params: {
                bus: valBus,
                pagina:1
            }
        });

        client.ok(function (result) {
            //Conexión exitosa
            if(application.ios)
                arreglo = [];
            else   
                arreglo = new observableArray.ObservableArray();
            page.bindingContext = {myItems: arreglo};
            //Parsear JSON
            //arreglo = [];
            if(application.android)
                jsonObj = JSON.parse(result.content);
            if(application.ios)
                jsonObj = JSON.parse(JSON.stringify(result._reponse.content));

            maxPag = jsonObj.maxPag;
            pag = jsonObj.pagina;
            jsonObj = jsonObj.listaElementos;
            //console.log("JSON: "+JSON.stringify(jsonObj));
            //console.log("lenght: "+jsonObj.length);
            
            if(jsonObj.length != 0)
            {
                //jsonObj.forEach(print);
                jsonObj.forEach(agregarItems);
                //loading.set("isLoading", false);
                page.bindingContext = {myItems: arreglo};
            }
            else
            {
                //loading.set("isLoading", false);

                if(application.android)
                    Toast.makeText(application.android.context, "No se encontraron clientes", Toast.LENGTH_LONG).show();   
                if(application.ios)
                {
                    dialogs.alert({title: "Mensaje",
                    message: "No se encontraron clientes",
                    okButtonText: "OK"}).then(function() {
                    });
                }
            }
            page.bindingContext = {myItems: arreglo};
        })
        .error(function (ctx) {
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
exports.buscarCliente = buscarCliente;

function agregarItems(value, index) {
    //console.log("en agregar items");
    //console.log("coti, total: "+value.cliId+" "+value.nombre+" "+value.precio);
    //agregar a arreglo observable
    arreglo.push({noCliente: value.cliId, cliente:value.nombre, val:value.precio, index:((pag-1)*20)+index, telefono:value.telefono});
    //console.log("tel: "+((pag-1)*20+index));
}
exports.agregarItems = agregarItems;

function loadMoreItems()
{
    console.log("**************** LoadMoreItems...pag: "+pag+"maxPag: "+maxPag);
    
    //if(ocupado.get("valOcupado") == false)
    //{
        //ocupado.set("valOcupado", true);
        //loading.set("isLoading", true);
        lista = page.getViewById("listaCotiz");
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

            //console.log(`@Task: ${Runtime.memoryUsage()}`);
        }
        pag++;
        console.log("pag++"+pag);
        if(pag <= maxPag)
        {
            client = ApiClient.newClient({
                baseUrl: "http://"+appSettings.getString("ip")+":8181/rest/clientes/buscarCliente",
            });

            client.get({
                params: {
                    bus: valBus,
                    pagina: pag,
                }
            });
            
            client.ok(function (result) 
            {
                //Conexión exitosa
                
                console.log("en OK de loadmore");
                //Parsear JSON
                //arreglo = [];
                var obj;
                if(application.android)
                    obj =  JSON.parse(result.content);
                if(application.ios)
                    obj =  JSON.parse(JSON.stringify(result._reponse.content));
                // = JSON.parse(result.content);
                obj = obj.listaElementos;
                //jsonObj = ;

                console.log("lenght: "+jsonObj.length);
                if(obj.length != 0)
                {
                    obj.forEach(agregarItems);
                    //loading.set("isLoading", false);
                    //ocupado.set("valOcupado", false);
                    //jsonObj = [];
                    page.bindingContext = {myItems: arreglo};
                    //loading.set("isLoading", false);
                    lista.notifyLoadOnDemandFinished();
                }
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
        //else
            //loading.set("isLoading", false); 
    //}
    lista.notifyLoadOnDemandFinished();
}
exports.loadMoreItems = loadMoreItems;

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

function dialogEliminarCliente()
{
    var nomCliente;
    if(application.ios)
        nomCliente = arreglo[indexItemSwiped].cliente;
    else   
        nomCliente = arreglo.getItem(indexItemSwiped).cliente;
    var options = {
        title: "Advertencia",
        message: "¿Desea remover al cliente "+nomCliente+" ?",
        okButtonText: "Sí",
        cancelButtonText: "No",
    };
    dialogs.confirm(options).then((result) => {
        if(result == true)
            eliminarCliente();
        else
            lista.notifySwipeToExecuteFinished();
    });
}
exports.dialogEliminarCliente = dialogEliminarCliente;

function eliminarCliente()
{
    var idCliente;
    if(application.ios)
        idCliente = arreglo[indexItemSwiped].noCliente;
    else   
        idCliente = arreglo.getItem(indexItemSwiped).noCliente;
    console.log("NoCliente: "+idCliente);

    client = ApiClient.newClient({
            baseUrl: "http://"+appSettings.getString("ip")+":8181/rest/clientes/eliminarCliente",
        });

        client.get({
            params: {
                cliId:idCliente
            }
        });

        client.ok(function (result) {
            console.log("Eliminado");
            var listview = page.getViewById("listaCotiz");
            listview.notifySwipeToExecuteFinished();
            listview.resumeUpdates(true);
            listview.refresh();
            buscarCliente();
            indexItemSwiped = null;
            //close();
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
exports.eliminarCliente = eliminarCliente;

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

function llamar(args)
{
    var index = args.object.tag;
    var tel;
    console.log("IND: "+index);
    //console.log("Número Tel: "+arreglo[index].telefono);
    if(application.android)
    {
        tel = arreglo.getItem(index).telefono;
        console.log("teléfono: "+tel);
        
       //if(utilsModule.openUrl("tel:0123456789") != false)
           // utilsModule.openUrl("tel:0123456789");
        
        if(application.android.foregroundActivity.getSystemService(android.content.Context.TELEPHONY_SERVICE).getSimState() == android.telephony.TelephonyManager.SIM_STATE_READY)
        {
            console.log("se puede llamar");
            var intent = android.content.Intent;
            var callIntent = new intent(android.content.Intent.ACTION_DIAL);
            callIntent.setData(android.net.Uri.parse("tel:"+tel));
            callIntent.setFlags(intent.FLAG_ACTIVITY_NEW_TASK);
            if(tel != "")
                application.android.context.startActivity(callIntent);
            else
            {
                dialogs.alert({title: "Error",
                message: "Número no proporcionado",
                okButtonText: "OK"}).then(function() {
                });
            }
        }
        else
        {
            dialogs.alert({title: "Error",
            message: "No se pueden realizar llamadas en este dispositivo",
            okButtonText: "OK"}).then(function() {
            });
        }
    }
    else
    {
        tel = arreglo[index].telefono;
        console.log("teléfono: "+tel);

        //if(utilsModule.openUrl("tel:0123456789") != false)
        if(tel != "")
            utilsModule.openUrl("tel:"+tel);
        else
        {
            dialogs.alert({title: "Error",
            message: "No se pueden realizar llamadas en este dispositivo",
            okButtonText: "OK"}).then(function() {
            });
        }
        //openUrl("tel://5555555555")
        //console.log();

        /*var phoneNumber = "0180012345";
        var webView = UIWebView.alloc('init');
        var url = NSURL.URLWithString('numberString');        
        var requestURL = NSURLRequest.requestWithURL(url); 
        webView.dataDetectorTypes = UIDataDetectorTypeNone;
        webView.loadRequest(requestURL);*/
        //window.open('tel:+375292771265', '_system');
        //console.log();
        //var URL = NSURL.URLWithString("tel://900-3440-567"); 
        //UIApplication.sharedApplication.openURL(URL);
        
        /*
            NSString *phoneNumber = @"Phone number here";
            UIWebView *webView = [[UIWebView alloc] init];
            NSURL *url = [NSURL URLWithString:numberString];        
            NSURLRequest *requestURL = [NSURLRequest requestWithURL:url]; 
            webView.dataDetectorTypes = UIDataDetectorTypeNone;
            [webView loadRequest:requestURL];
        */

        /*
        //Swift
            string phoneNumber = "1231231234";
            NSUrl url = new NSUrl(string.Format(@"telprompt://{0}", phoneNumber));
            UIApplication.SharedApplication.OpenUrl(url);
        //Objective-C
            NSString *phoneNumber = @"1-800-555-1212"; // dynamically assigned
            NSString *phoneURLString = [NSString stringWithFormat:@"tel:%@", phoneNumber];
            NSURL *phoneURL = [NSURL URLWithString:phoneURLString];
            [[UIApplication sharedApplication] openURL:phoneURL];
        
        var phoneNumber = "1-800-555-1212"; // dynamically assigned
        var phoneURLString =  NSString.stringWithFormat();
        var phoneURL = new NSURL.URLWithString(phoneURLString);
        UIApplication.sharedApplication.openURL(phoneURL);
        */
    }
}
exports.llamar = llamar;

function isTelephonyEnabled()
{
    console.log("Estado SIM: "+application.android.foregroundActivity.getSystemService(android.content.Context.TELEPHONY_SERVICE).getSimState());
    /*var telephonyManager = application.android.foregroundActivity.getSystemService("TELEPHONY_SERVICE");
    return telephonyManager.getSimState();
    private boolean isTelephonyEnabled(){
        TelephonyManager telephonyManager = (TelephonyManager)getSystemService(TELEPHONY_SERVICE);
        return telephonyManager != null && telephonyManager.getSimState()==TelephonyManager.SIM_STATE_READY;
    }
    */
    
    /*if ((application.android.foregroundActivity.getSystemService("TELEPHONY_SERVICE")).getLine1Number() == null)
    {
       console.log("No llamadas");
    }*/
}
exports.isTelephonyEnabled = isTelephonyEnabled;

/*Llamadas
    telephonyManager != null &&  == android.telephony.TelephonyManager.SIM_STATE_READY
    //Intent en android
    Intent callIntent = new Intent(Intent.ACTION_VIEW);
    callIntent.setData(Uri.parse("tel:0123456789"));
    startActivity(callIntent);

    Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + PhoneNumber));
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    context.startActivity(intent);

    //PhoneNumber
    startActivity( new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + PhoneNumber)));

    iOS 
    //Como llamar 
    string phoneNumber = "1231231234";
    NSUrl url = new NSUrl(string.Format(@"telprompt://{0}", phoneNumber));
    UIApplication.SharedApplication.OpenUrl(url);
*/
