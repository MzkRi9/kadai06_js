$("#add_image").on("click",function(){
    $(".popup").slideDown();
    $("main").css('pointer-events','none');
});

$("#closePopup").on("click",function(){
    $(".popup").slideUp();
    $("main").css('pointer-events','');
});

$("#new-label").on("change",function(){
    $(this).css("color", "#000");
});

$("#save").on("click",function(){
    $(".popup").slideUp();
    $("main").css('pointer-events','');
});
