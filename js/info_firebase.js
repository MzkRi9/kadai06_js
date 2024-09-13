$('input[type="date"]').on('click', function() {
    $(this).get(0).showPicker();
});

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, remove, onChildRemoved } //ここで宣言したものしか使えない
from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//RealtimeDBに接続する
const db = getDatabase(app);
//ReartimeDB内の「chat」という階層を参照する
const dbRef = ref(db,"infopost"); //refは参照の意味

const selectElement = $("#new-label");

//idnameがsendのところをクリックしたら
$("#save").on("click",function(){

//入力した時間とテキストを準備
    const date = new Date($("#date-input").val());
    const m = date.getMonth();
    const l = selectElement.val();
    console.log(l);

    const msg ={
        y : date.getFullYear(),
        truem : m+1,
        d : date.getDate(),
        sh : $("#start-hour").val(),
        sm : $("#start-min").val(),
        eh : $("#end-hour").val(),
        em : $("#end-min").val(),
        label: l,
        title: $("#newTitle").val(),
        post : $("#new-post").val()
    }
    console.log(msg);

    //firebaseでユニークキーを生成
    const newPostRef = push(dbRef); //pushとは配列の末尾(後ろ)に新しい要素を追加するためのメソッドです。
    //"infopost"にユニークKEYをつけてオブジェクトデータを登録
    set(newPostRef,msg);

    $("#newTitle").val("");
    $("#new-post").val("");
    $("#date-input").val("");
    $("input").val("");
    $("#new-label").val("ラベル").css("color", "#777");
});

//データが追加された時だけではなく、ページが読み込まれた時にもonChildAddedが書かれている行が動くように
onChildAdded(dbRef,function(data){
    //msgのデータをもらう
    const msg = data.val();
    //もらったデータのkeyをもらう
    const key = data.key; //削除・更新に必須
    console.log(data.key);
    //表示させる内容を指定

    let postView = `
        <div id = "${key}">
            <div style = "display:flex; justify-content: space-between;">
                <div class = "post-time">${msg.y}年${msg.truem}月${msg.d}日 ${msg.sh}:${msg. sm}-${msg.eh}:${msg.em}</div>
                <div class="label">${msg.label}</div>
            </div>
            <textarea class = "post-title" readonly>${msg.title}</textarea>
            <textarea class = "post-content" readonly>${msg.post}</textarea>
            <div class="event">
                <div class="like" data-key= "${key}">
                    <img src="./img/02_info/heart_white.png" class="heart">
                </div>
                <div class="delete" data-key= "${key}">
                    <img src="./img/02_info/12_delete_white.png" class="deleteimg">
                </div>
            </div>
        </div>`

    //表示する内容の場所を指定
    $("#post-view").prepend(postView);
});

//タイトルをクリックしたら詳細が現れて、もう1回タイトルをクリックすると詳細が消える
$("#post-view").on("click",".post-title",function(){
    $(this).next(".post-content").slideToggle();
});

//いいねイベント
$("#post-view").on("click",".heart",function(){
    const img = $(this);
    const currentSrc = img.attr('src');
    if (currentSrc.endsWith('heart_white.png')) {
        img.attr('src', './img/02_info/heart_red.png');
    } else {
        img.attr('src', './img/02_info/heart_white.png');
    }
});

//削除イベント
$("#post-view").on("click",".delete",function(){
    const key = $(this).attr("data-key");
    console.log(key);
    const delete_item = ref(db,"infopost/"+key);
    console.log(delete_item);
    //ここでfirebaseのデータを削除
    remove(delete_item);
});

//削除処理がFirebase側で実行されたらイベント発生！
onChildRemoved(dbRef, (data) => {
    console.log(data.key);
    $("#"+data.key).remove();
        alert("削除しました");
});

// 投稿データを格納する配列
let posts = [];

onChildAdded(dbRef, function(data) {
    // 新しい投稿のデータを取得
    const msg = data.val();
    const key = data.key;

    // 投稿を配列に追加
    posts.push({
        key: key,
        y: msg.y,
        truem: msg.truem,
        d: msg.d,
        sh: msg.sh,
        sm: msg.sm,
        eh: msg.eh,
        em: msg.em,
        label: msg.label,
        title: msg.title,
        post: msg.post
    });

    // 投稿を遅い順（未来の日時が上）にソート
    posts.sort(function(a, b) {
        const dateA = new Date(a.y, a.truem - 1, a.d, a.sh, a.sm);
        const dateB = new Date(b.y, b.truem - 1, b.d, b.sh, b.sm);
        return dateB - dateA; // 遅い順に並び替え（大きい日時が先）
    });

    // 投稿を再表示
    renderPosts();
});

// 投稿を表示する関数
function renderPosts() {
    $("#post-view").empty(); // 一旦、全てクリアする

    // 並び替えられた投稿を再描画
    posts.forEach(function(msg) {
        let postView = `
            <div id = "${msg.key}">
                <div style = "display:flex; justify-content: space-between;">
                    <div class = "post-time">${msg.y}年${msg.truem}月${msg.d}日 ${msg.sh}:${msg.sm}-${msg.eh}:${msg.em}</div>
                    <div class="label">${msg.label}</div>
                </div>
                <textarea class = "post-title" readonly>${msg.title}</textarea>
                <textarea class = "post-content" readonly>${msg.post}</textarea>
                <div class="event">
                    <div class="like" data-key= "${msg.key}">
                        <img src="./img/02_info/heart_white.png" class="heart">
                    </div>
                    <div class="delete" data-key= "${msg.key}">
                        <img src="./img/02_info/12_delete_white.png" class="deleteimg">
                    </div>
                </div>
            </div>`;
        
        $("#post-view").append(postView);
    });
}


$(document).ready(function () {
    $("#toggle-mode").on("click",function(){
        $("body").toggleClass("light-mode").css({"color":"#000","background-color":"#F8F7F1"});
        $("header").css("background-color","#F8F7F1");
        $("footer").css("background-color","#F8F7F1");
        $("textarea").css("background-color","#fff");
        $("#logo").attr("src","./img/00_other/00_logo_black.png");
        $("#alert").attr("src","./img/00_other/00_alert_black.png");
        $("#day_image").attr("src","./img/02_info/08_day_black.png");
        $("#toggle-mode").attr("src","./img/02_info/dark_black.png");
        $("#add_image").attr("src","./img/02_info/add_black.png");
        $(".heart").attr("src","./img/02_info/heart_gray.png");
        $(".deleteimg").attr("src","./img/02_info/12_delete_gray.png");
        $("#daily_image").attr("src","./img/00_other/02_daily_black.png");
    });
});