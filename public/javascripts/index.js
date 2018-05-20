$('#like').on('click', function(){
  var username = $('#like').attr('user');
  var articleId = $('#like').attr('articleId');
  if(username != ''){ // if the user is logged in
    if($('#like').text() == 'Like'){ // if the user is logged in and the text is 'like' is shows he has not liked it yet
      $.post(`/profile/${username}/likes/${articleId}`, function(err,status,done){ // send post to server to update his interest
        //if(err) throw err;
        console.log(status + done);
        $('#like').text('Liked').removeClass().addClass('btn btn-default'); // remove all class names add new. modify the text to show it has been liked
        var likes = parseInt($('.likesNo').text());
        $('.likesNo').text(likes + 1);
      });
    }
    else{ // the user is loggedin and the text is 'Liked' i.e he had already liked it
      $.post(`/profile/${username}/likes/${articleId}`, function(err,status,done){ //make post to server to dislike this article
        //if(err) throw err; 
        console.log(status + done);
        $('#like').text('Like').removeClass().addClass('btn btn-primary'); // add the class and text to show his dislike status
        var likes = parseInt($('.likesNo').text())
        $('.likesNo').text(likes - 1);
      })
    }
  }
  else{ // the user is not loggedin
    alert('You must be logged in to like an article');
  }
  
  
})



$('.follow').on('click', function(){
  var $this = $(this);
  var username = $this.attr('username');
  var userId = $this.attr('userId');
  console.log(username)
  console.log(userId);
  // if the user is logged in and the text is 'follow' is shows he has not liked it yet
  $.post(`/profile/${username}/follow/${userId}`, function(err,status,done){ // send post to server to update his interest
    console.log(status);
      console.log(done);
    $this.hide(0,function(){ // hide only the button clicked
      $this.siblings().show(); // show only the sibling of the button clicked
    });
    
    //var follower_No = parseInt($('#follower_No').text())
    //$('#follower_No').text(follower_No + 1);
  });
});
$('.unfollow').on('click', function(){
  var $this = $(this);
  var username = $this.attr('username');
  var userId = $this.attr('userId');
  // if the user is logged in and the text is 'follow' is shows he has not liked it yet
  $.post(`/profile/${username}/unfollow/${userId}`, function(err,status,done){ // send post to server to update his interest
    console.log(status + done);
    $this.hide(0,function(){
      $this.siblings().show();
    });
    
    //var follower_No = parseInt($('#follower_No').text())
    //$('#follower_No').text(follower_No - 1);
  });
});


$('#share').on('click', function(){
  //alert();
  if($('#share').text() == 'Share'){
    $('#share').text('Shared').css({backgroundColor:'grey',borderColor:'grey'})
  }
  else{
    $('#share').text('Share').css({backgroundColor:'#337ab7',borderColor:'#2e6da4'})
  }
  
})
