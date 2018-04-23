//var b_cart={}
var b_copies_limit = 3;
var b_cart_items_count = 0;
var currentbook = 0;


//localStorage.removeItem('dataObject');
retrievedObject = localStorage.getItem('dataObject');
console.log("boo " + (retrievedObject === null));
if (!(retrievedObject === null)) {

    b_cart = JSON.parse(retrievedObject);
   
}
else {
    b_cart = {};
    //b_cart_items_count = getb_cart_items_count();

}

function getb_cart_items_count() {
    var i_count = 0;
    console.log("maha" + typeof (b_cart));
    Object.keys(b_cart).forEach(function (key) {
        i_count += b_cart[key];
        console.log("----" + b_cart[key]);

    });
    console.log("mahadsd");
    // for (key in Object.keys(b_cart)) {
    //     i_count += b_cart[key];
    //     console.log("icount --" + b_cart[key])
    // }
    document.getElementById("b_cart_items_count").innerText = i_count;
    console.log("icount################" + i_count)
    return i_count;
}

function clearcart(){
    console.log("Im clearing cart")
    localStorage.removeItem("dataObject");
    b_cart={};
    document.getElementById("b_cart_items_count").innerText = getb_cart_items_count();
}

function loadDoc(url, cFunction) {
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            cFunction(this);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

loadDoc("/api/books",genDynamicContent);
function genDynamicContent(x){
    temp = JSON.parse(x.responseText);
    display(0);
    setButtons();
    //document.getElementById("b_cart_items_count").innerText = getb_cart_items_count();


}

function display(bookID) {
    // get the movie data for the given ID
    //console.log(temp.items[bookID])
    // update the DOM using the element IDs
    document.getElementById("b_title").innerHTML = temp.items[bookID].volumeInfo.title;
    document.getElementById("b_desc").innerHTML = temp.items[bookID].volumeInfo.description;
    document.getElementById("b_moreinfo").href = temp.items[bookID].volumeInfo.previewLink;
    document.getElementById("b_thumbnail").src = temp.items[bookID].volumeInfo.imageLinks.thumbnail;
    document.getElementById("b_authors").innerHTML = temp.items[bookID].volumeInfo.authors;
    document.getElementById("b_amt").innerHTML = '&#8377; ' + amount();
    document.getElementById("b_publisher").innerHTML = temp.items[bookID].volumeInfo.publisher;
    document.getElementById("b_dop").innerHTML = temp.items[bookID].volumeInfo.publishedDate;
    document.getElementById("b_cart_items_count").innerText = getb_cart_items_count();

}




function amount() {
    var temp1 = "";
    if (temp.items[currentbook].saleInfo.listPrice)
        temp1 = temp1 + temp.items[currentbook].saleInfo.listPrice.amount;
    else {
        temp1 = temp1 + "Not available";
    }
    return temp1;
}
function setButtons() {
    movieCnt = temp.items.length;

    if (!(temp.items[currentbook].saleInfo.hasOwnProperty("listPrice")))
        document.getElementById("addtocart").disabled = true;
    else
        document.getElementById("addtocart").disabled = false;
    // disable prev when it is the first movie
    if (currentbook == 0)
        document.getElementById("prev").disabled = true;
    // disable next when the current movie is the last one in the list 
    if (currentbook == movieCnt - 1)
        document.getElementById("next").disabled = true;
    // enable the prev button when the current movie is not the first one
    if (currentbook > 0)
        document.getElementById("prev").disabled = false;
    // enable the next button when the current movie is not the last one
    if (currentbook < movieCnt - 1)
        document.getElementById("next").disabled = false;
    
    if (b_cart[temp.items[currentbook].id] >= b_copies_limit) {  //if the user selects the book more than 3 times
        document.getElementById("addtocart").disabled = true;
    }
    document.getElementById("b_cart_items_count").innerText = getb_cart_items_count();

}
/* call init to disable the buttons */

// show the next movie
function next() {
    display(++currentbook);
    setButtons();
}
// show the previous movie
function prev() {
    display(--currentbook);
    setButtons();
    
}


function addBookToCart(){
    
    //add book to b_cart object and also validate if the no.of copies of each book is less than 4
    var temp_b_id = temp.items[currentbook].id;
    if (!b_cart.hasOwnProperty(temp_b_id)){
        b_cart[temp_b_id] = 1; //if the user selects the book for the first time
        document.getElementById("addtocart").disabled = false;
        //b_cart_items_count++;
    }
    else{
        b_cart[temp_b_id] = b_cart[temp_b_id] + 1;
        //b_cart_items_count++;
        if (b_cart[temp_b_id] >= b_copies_limit) {  //if the user selects the book more than 3 times
            document.getElementById("addtocart").disabled = true;
        }

    }
    if (0!= 0) {
        document.getElementById("b_cart_items_count").setAttribute("style", "display:none;");
    }
    else {
        console.log("heee")
        document.getElementById("b_cart_items_count").setAttribute("style", "display:block;")
    }
    console.log("iiiiiiiiiiiiii");
    //console.log(b_cart_items_count);
        document.getElementById("b_cart_items_count").innerText = getb_cart_items_count();
    console.log("Total Items Count" +getb_cart_items_count());
    localStorage.setItem('dataObject', JSON.stringify(b_cart));
    console.log(localStorage.getItem("dataObject"))
    

}

function checkout() {
    console.log("im in c");
    checkoutOrder("/checkout", b_cart);
}
function checkoutOrder(url, jsonObject) {
    console.log("im in d");

    // if (jsonObject.length>0){
    console.log("post started")
    var xhttp;
    xhttp = new XMLHttpRequest();
    xhttp.open("POST", url,true)
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    console.log("post completed1")
    xhttp.send(JSON.stringify(jsonObject));
    //xhttp.send("u_cart="+JSON.stringify(jsonObject));
    console.log("Sending ..." + "u_cart=" + JSON.stringify(jsonObject))
    console.log("post completed2")
    xhttp.onload = function () {
        // Do whatever with response
        //alert(xhttp.responseText);
        loadDoc("/getcheckoutform", loadCheckOutForm)
    }
    //xhttp.onloadend = loadDoc("/getcheckoutform", loadCheckOutForm)
    console.log("post completed3")
    // }
}
function loadCheckOutForm(x) {
    console.log("Im in checkoutform" + x.responseText)
    document.querySelector(".container").innerHTML = x.responseText;
}
