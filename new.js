function search(){
    var markup = document.documentElement.innerHTML;
    let input = document.getElementById('search_bar').value.toLowerCase();
    if(markup.toLowerCase().search(input) > -1){
        x[i].style.display ='';
    }
    else{
        x[i].style.display = 'none';
    }
}