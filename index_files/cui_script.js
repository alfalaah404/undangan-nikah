jQuery(document).ready(function ($) {
  $(this).find(':submit').removeAttr("disabled");
  CUI = {
    ajaxurl: CUI_WP.ajaxurl,
    nonce: CUI_WP.cuiNonce,
    textCounter: CUI_WP.textCounter,
    textCounterNum: (CUI_WP.textCounterNum !== '') ? CUI_WP.textCounterNum : 300,
    jpages: CUI_WP.jpages,
    numPerPage: (CUI_WP.jPagesNum !== '') ? CUI_WP.jPagesNum : 10,
    widthWrap: (CUI_WP.widthWrap !== '') ? CUI_WP.widthWrap : '',
    autoLoad: CUI_WP.autoLoad,
    thanksComment: CUI_WP.thanksComment,
    thanksReplyComment: CUI_WP.thanksReplyComment,
    duplicateComment: CUI_WP.duplicateComment,
    insertImage: CUI_WP.insertImage,
    insertVideo: CUI_WP.insertVideo,
    insertLink: CUI_WP.insertLink,
    accept: CUI_WP.accept,
    cancel: CUI_WP.cancel,
    reply: CUI_WP.reply,
    checkVideo: CUI_WP.checkVideo,
    textWriteComment: CUI_WP.textWriteComment,
    classPopularComment: CUI_WP.classPopularComment,
  };

  //Remove duplicate comment box
  jQuery('.cui-wrap-comments').each(function (index, element) {
    var ids = jQuery('[id=\'' + this.id + '\']');
    if (ids.length > 1) {
      ids.slice(1).closest('.cui-wrapper').remove();
    }
  });

  //Remove id from input hidden comment_parent and comment_post_ID. Para prevenir duplicados
  jQuery('.cui-container-form [name="comment_parent"], .cui-container-form [name="comment_post_ID"]').each(function (index, input) {
    $(input).removeAttr('id');
  });


  // Textarea Counter Plugin
  // if (typeof jQuery.fn.textareaCount == 'function' && CUI.textCounter == 'true') {
  //   $('.cui-textarea').each(function () {
  //     var textCount = {
  //       'maxCharacterSize': CUI.textCounterNum,
  //       'originalStyle': 'cui-counter-info',
  //       'warningStyle': 'cui-counter-warn',
  //       'warningNumber': 20,
  //       'displayFormat': '#left'
  //     };
  //     $(this).textareaCount(textCount);
  //   });
  // }

  // PlaceHolder Plugin
  if (typeof jQuery.fn.placeholder == 'function') {
    $('.cui-wrap-form input, .cui-wrap-form textarea, #cui-modal input, #cui-modal textarea').placeholder();
  }
  // Autosize Plugin
  if (typeof autosize == 'function') {
    autosize($('textarea.cui-textarea'));
  }

  //Actualizamos alturas de los videos
  $('.cui-wrapper').each(function () {
    rezizeBoxComments_CUI($(this));
    restoreIframeHeight($(this));
  });
  $(window).resize(function () {
    $('.cui-wrapper').each(function () {
      rezizeBoxComments_CUI($(this));
      restoreIframeHeight($(this));
    });
  });

  // CAPTCHA
  if ($('.cui-captcha').length) {
    captchaValues = captcha_CUI(9);
    $('.cui-captcha-text').html(captchaValues.n1 + ' &#43; ' + captchaValues.n2 + ' = ');
  }

  // OBTENER COMENTARIOS

  $(document).delegate('a.cui-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_CUI($(this).attr('href'));
    var post_id = linkVars.post_id;
    var num_comments = linkVars.comments;
    var num_get_comments = linkVars.get;
    var order_comments = linkVars.order;
    $("#cui-wrap-commnent-" + post_id).slideToggle(200);
    var $container_comment = $('#cui-container-comment-' + post_id);
    if ($container_comment.length && $container_comment.html().length === 0) {
      getComments_CUI(post_id, num_comments, num_get_comments, order_comments);
    }
    return false;
  });
  // CARGAR COMENTARIOS AUTOMÁTICAMENTE

  if ($('a.cui-link').length) {
    $('a.cui-link.auto-load-true').each(function () {
      $(this).click();
    });
  }

  //Mostrar - Ocultar Enlaces de Responder, Editar
  // $(document).delegate('li.cui-item-comment', 'mouseover mouseout', function (event) {
  //   event.stopPropagation();
  //   if (event.type === 'mouseover') {
  //     $(this).find('.cui-comment-actions:first').show();
  //   } else {
  //     $(this).find('.cui-comment-actions').hide();
  //   }
  // });

  //Cancelar acciones
  $(document).find('.cui-container-form').keyup(function (tecla) {
    post_id = $(this).find('form').attr('id').replace('commentform-', '');
    if (tecla.which == 27) {
      cancelCommentAction_CUI(post_id);
    }
  });

  //Mostrar - Ocultar Enlaces de Responder, Editar
  $(document).delegate('input.cui-cancel-btn', 'click', function (event) {
    event.stopPropagation();
    post_id = $(this).closest('form').attr('id').replace('commentform-', '');
    cancelCommentAction_CUI(post_id);
  });

  // RESPONDER COMENTARIOS
  $(document).delegate('.cui-reply-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_CUI($(this).attr('href'));
    var comment_id = linkVars.comment_id;
    var post_id = linkVars.post_id;
    //Restauramos cualquier acción
    cancelCommentAction_CUI(post_id);
    var form = $('#commentform-' + post_id);
    form.find('[name="comment_parent"]').val(comment_id);//input oculto con referencia al padre
    form.find('.cui-textarea').val('').attr('placeholder', CUI_WP.reply + '. ESC (' + CUI_WP.cancel + ')').focus();
    form.find('input[name="submit"]').addClass('cui-reply-action');
    $('#commentform-' + post_id).find('input.cui-cancel-btn').show();
    //scroll
    scrollThis_CUI(form);

    return false;
  });

  //EDITAR COMENTARIOS
  $(document).delegate('.cui-edit-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_CUI($(this).attr('href'));
    var comment_id = linkVars.comment_id;
    var post_id = linkVars.post_id;
    //Restauramos cualquier acción
    cancelCommentAction_CUI(post_id);
    var form = $('#commentform-' + post_id);
    form.find('[name="comment_parent"]').val(comment_id);//input oculto con referencia al padre
    form.find('.cui-textarea').val('').focus();
    form.find('input[name="submit"]').addClass('cui-edit-action');
    //scroll
    scrollThis_CUI(form);
    getCommentText_CUI(post_id, comment_id);
  });

  //ELIMINAR COMENTARIOS
  $(document).delegate('.cui-delete-link', 'click', function (e) {
    e.preventDefault();
    var linkVars = getUrlVars_CUI($(this).attr('href'));
    var comment_id = linkVars.comment_id;
    var post_id = linkVars.post_id;
    if (confirm(CUI_WP.textMsgDeleteComment)) {
      deleteComment_CUI(post_id, comment_id);
    }
  });

  $('input, textarea').focus(function (event) {
    $(this).removeClass('cui-error');
    $(this).siblings('.cui-error-info').hide();
  });

  // ENVIAR COMENTARIO
  $(document).on('submit', '.cui-container-form form', function (event) {
    event.preventDefault();
    $(this).find(':submit').attr("disabled", "disabled");
    $('input, textarea').removeClass('cui-error');
    var formID = $(this).attr('id');
    var post_id = formID.replace('commentform-', '');
    var form = $('#commentform-' + post_id);
    var link_show_comments = $('#cui-link-' + post_id);
    var num_comments = link_show_comments.attr('href').split('=')[2];
    var form_ok = true;

    // VALIDAR COMENTARIO
    var $content = form.find('textarea').val().replace(/\s+/g, ' ');
    //Si el comentario tiene menos de 2 caracteres no se enviará
    if ($content.length < 2) {
      form.find('.cui-textarea').addClass('cui-error');
      form.find('.cui-error-info-text').show();
      setTimeout(function () {
        form.find('.cui-error-info-text').fadeOut(500);
      }, 2500);
      $(this).find(':submit').removeAttr('disabled');
      return false;
    }
    else {
      // VALIDAR CAMPOS DE TEXTO
      if ($(this).find('input#author').length) {
        var $author = $(this).find('input#author');
        var $authorVal = $author.val().replace(/\s+/g, ' ');
        var $authorRegEx = /^[^?%$=\/]{1,30}$/i;

        if ($authorVal == ' ' || !$authorRegEx.test($authorVal)) {
          $author.addClass('cui-error');
          form.find('.cui-error-info-name').show();
          setTimeout(function () {
            form.find('.cui-error-info-name').fadeOut(500);
          }, 3000);
          form_ok = false;
        }
      }
      if ($(this).find('input#email').length) {
        var $emailRegEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
        var $email = $(this).find('input#email');
        var $emailVal = $email.val().replace(/\s+/g, '');
        $email.val($emailVal);

        if (!$emailRegEx.test($emailVal)) {
          $email.addClass('cui-error');
          form.find('.cui-error-info-email').show();
          setTimeout(function () {
            form.find('.cui-error-info-email').fadeOut(500);
          }, 3000);
          form_ok = false;
        }
      }
      if (!form_ok) {
        $(this).find(':submit').removeAttr('disabled');
        return false;
      }

      // VALIDAR CAPTCHA
      if ($('.cui-captcha').length) {
        var captcha = $('#cui-captcha-value-' + post_id);
        form_ok = true;
        if (captcha.val() != (captchaValues.n1 + captchaValues.n2)) {
          form_ok = false;
          captcha.addClass('cui-error');
        }
        captchaValues = captcha_CUI(9);
        $('.cui-captcha-text').html(captchaValues.n1 + ' &#43; ' + captchaValues.n2 + ' = ');
        captcha.val('');
      }

      //Si el formulario está validado
      if (form_ok === true) {
        //Si no existe campo lo creamos
        if (!form.find('input[name="comment_press"]').length) {
          form.find('input[name="submit"]').after('<input type="hidden" name="comment_press" value="true">');
        }
        comment_id = form.find('[name="comment_parent"]').val();
        //Insertamos un nuevo comentario
        if (form.find('input[name="submit"]').hasClass('cui-edit-action')) {
          editComment_CUI(post_id, comment_id);
        }
        else if (form.find('input[name="submit"]').hasClass('cui-reply-action')) {
          insertCommentReply_CUI(post_id, comment_id, num_comments);
        }
        else {
          insertComment_CUI(post_id, num_comments);
        }
        cancelCommentAction_CUI(post_id);
      }
      $(this).find(':submit').removeAttr('disabled');
    }
    return false;
  });//end submit

  function getComments_CUI(post_id, num_comments, num_get_comments, order_comments) {
    var status = $('#cui-comment-status-' + post_id);
    var $container_comments = $("ul#cui-container-comment-" + post_id);
    if (num_comments > 0) {
      jQuery.ajax({
        type: "POST",
        dataType: "html",// tipo de información que se espera de respuesta
        url: CUI.ajaxurl,
        data: {
          action: 'get_comments',
          post_id: post_id,
          get: num_get_comments,
          order: order_comments,
          nonce: CUI.nonce
        },
        beforeSend: function () {
          status.addClass('cui-loading').html('<span class="cuio-loading"></span>').show();
        },
        success: function (data) {
          status.removeClass('cui-loading').html('').hide();
          $container_comments.html(data);
          highlightPopularComments_CUI(post_id, $container_comments);
          $container_comments.show();//Mostramos los Comentarios
          //Insertamos Paginación de Comentarios
          jPages_CUI(post_id, CUI.numPerPage);
          toggleMoreComments($container_comments);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          clog('ajax error');
          clog('jqXHR');
          clog(jqXHR);
          clog('errorThrown');
          clog(errorThrown);
        },
        complete: function (jqXHR, textStatus) {
        }
      });//end jQuery.ajax
    }//end if
    return false;
  }//end function


  function highlightPopularComments_CUI(post_id, $container_comments) {
    var order = $container_comments.data('order');
    if (order == 'likes' && $container_comments.hasClass('cui-multiple-comments cui-has-likes')) {
      var top_likes = $container_comments.find('>.cui-item-comment').eq(0).data('likes');
      var temp = false;
      $container_comments.find('>.cui-item-comment').each(function (index, comment) {
        if (!temp && $(comment).data('likes') == top_likes) {
          $(comment).addClass(CUI.classPopularComment);
          temp = true;
        }
      });
    }
  }

  function jQFormSerializeArrToJson(formSerializeArr) {
    var jsonObj = {};
    jQuery.map(formSerializeArr, function (n, i) {
      jsonObj[n.name] = n.value;
    });

    return jsonObj;
  }

  function insertComment_CUI(post_id, num_comments) {
    var link_show_comments = $('#cui-link-' + post_id);
    var comment_form = $('#commentform-' + post_id);
    var status = $('#cui-comment-status-' + post_id);
    var form_data = comment_form.serialize();//obtenemos los datos

    $.ajax({
      type: 'post',
      method: 'post',
      url: comment_form.attr('action'),
      data: form_data,
      dataType: "html",
      beforeSend: function () {
        status.addClass('cui-loading').html('<span class="cuio-loading"></span>').show();
      },
      success: function (data, textStatus) {
        cc('success data', data)
        status.removeClass('cui-loading').html('');
        if (data != "error") {
          status.html('<p class="cui-ajax-success">' + CUI.thanksComment + '</p>');
          if (link_show_comments.find('span').length) {
            num_comments = String(parseInt(num_comments, 10) + 1);
            link_show_comments.find('span').html(num_comments);
          }

          loadCountComment();
          loadCountKonfirmasi();
          loadAllComment();

        }
        else {
          status.html('<p class="cui-ajax-error">Error processing your form</p>');
        }
        //Agregamos el nuevo comentario a la lista
        $('ul#cui-container-comment-' + post_id).prepend(data).show();
        //Actualizamos el Paginador
        jPages_CUI(post_id, CUI.numPerPage, true);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        status.removeClass('cui-loading').html('<p class="cui-ajax-error" >' + CUI.duplicateComment + '</p>');
      },
      complete: function (jqXHR, textStatus) {
        setTimeout(function () {
          status.removeClass('cui-loading').fadeOut(600);
        }, 2500);
      }
    });//end ajax
    return false;
  }

  function insertCommentReply_CUI(post_id, comment_id, num_comments) {
    var link_show_comments = $('#cui-link-' + post_id);
    var comment_form = $('#commentform-' + post_id);
    var status = $('#cui-comment-status-' + post_id);
    var item_comment = $('#cui-item-comment-' + comment_id);
    var form_data = comment_form.serialize();//obtenemos los datos

    $.ajax({
      type: 'post',
      method: 'post',
      url: comment_form.attr('action'),
      data: form_data,
      beforeSend: function () {
        status.addClass('cui-loading').html('<span class="cuio-loading"></span>').show();
      },
      success: function (data, textStatus) {
        cc('success data', data)
        status.removeClass('cui-loading').html('');
        if (data != "error") {
          status.html('<p class="cui-ajax-success">' + CUI.thanksReplyComment + '</p>');
          if (link_show_comments.find('span').length) {
            num_comments = parseInt(num_comments, 10) + 1;
            link_show_comments.find('span').html(num_comments);
          }
          if (!item_comment.find('ul').length) {
            item_comment.append('<ul class="children"></ul>');
          }
          //Agregamos el nuevo comentario a la lista
          item_comment.find('ul').append(data);

          //scroll
          setTimeout(function () {
            scrollThis_CUI(item_comment.find('ul li').last());
          }, 1000);
        }
        else {
          status.html('<p class="cui-ajax-error">Error in processing your form.</p>');
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        status.html('<p class="cui-ajax-error" >' + CUI.duplicateComment + '</p>');
      },
      complete: function (jqXHR, textStatus) {
        setTimeout(function () {
          status.removeClass('cui-loading').fadeOut(600);
        }, 2500);
      }
    });//end ajax
    return false;

  }

  function editComment_CUI(post_id, comment_id) {
    var form = $("#commentform-" + post_id);
    var status = $('#cui-comment-status-' + post_id);
    jQuery.ajax({
      type: "POST",
      //dataType: "html",
      url: CUI.ajaxurl,
      data: {
        action: 'edit_comment_cui',
        post_id: post_id,
        comment_id: comment_id,
        comment_content: form.find('.cui-textarea').val(),
        nonce: CUI.nonce
      },
      beforeSend: function () {
        status.addClass('cui-loading').html('<span class="cuio-loading"></span>').show();
      },
      success: function (result) {
        status.removeClass('cui-loading').html('');
        var data = jQuery.parseJSON(result);
        if (data.ok === true) {
          $('#cui-comment-' + comment_id).find('.cui-comment-text').html(data.comment_text);
          //scroll
          setTimeout(function () {
            scrollThis_CUI($('#cui-comment-' + comment_id));
          }, 1000);
        }
        else {
          console.log("Errors: " + data.error);
        }
      },//end success
      complete: function (jqXHR, textStatus) {
        setTimeout(function () {
          status.removeClass('cui-loading').fadeOut(600);
        }, 2500);
      }
    });//end jQuery.ajax
    return false;
  }

  function getCommentText_CUI(post_id, comment_id) {
    var form = $("#commentform-" + post_id);
    var status = $('#cui-comment-status-' + post_id);
    jQuery.ajax({
      type: "POST",
      dataType: "html",
      url: CUI.ajaxurl,
      data: {
        action: 'get_comment_text_cui',
        post_id: post_id,
        comment_id: comment_id,
        nonce: CUI.nonce
      },
      beforeSend: function () {
        //status.addClass('cui-loading').html('<span class="cuio-loading"></span>').show();
      },
      success: function (data) {
        //status.removeClass('cui-loading').html('');
        if (data !== 'cui-error') {
          $('#cui-textarea-' + post_id).val(data);
          autosize.update($('#cui-textarea-' + post_id));
          //$('#commentform-'+post_id).find('input[name="submit"]').hide();
          $('#commentform-' + post_id).find('input.cui-cancel-btn').show();
        }
        else {

        }
      },//end success
      complete: function (jqXHR, textStatus) {
        //setTimeout(function(){
        //status.removeClass('cui-loading').hide();
        //},2500);
      }
    });//end jQuery.ajax
    return false;
  }//end function


  function deleteComment_CUI(post_id, comment_id) {
    jQuery.ajax({
      type: "POST",
      dataType: "html",
      url: CUI.ajaxurl,
      data: {
        action: 'delete_comment_cui',
        post_id: post_id,
        comment_id: comment_id,
        nonce: CUI.nonce
      },
      beforeSend: function () {
      },
      success: function (data) {
        if (data === 'ok') {
          $('#cui-item-comment-' + comment_id).remove();
        }
      }//end success
    });//end jQuery.ajax
    return false;
  }//end function

  //MOSTRAR/OCULTAR MÁS COMENTARIOS
  function toggleMoreComments($container_comments) {
    //console.log("======================= toggleMoreComments ", $container_comments.attr('id'));
    var liComments = $container_comments.find('>li.depth-1.cui-item-comment');
    liComments.each(function (index, element) {
      var ulChildren = $(this).find('> ul.children');
      if (ulChildren.length && ulChildren.find('li').length > 3) {
        ulChildren.find('li:gt(2)').css('display', 'none');
        ulChildren.append('<a href="#" class="cui-load-more-comments">' + CUI_WP.textLoadMore + '</a>');
      }
    });
  }

  $(document).delegate('a.cui-load-more-comments', 'click', function (e) {
    e.preventDefault();
    $(this).parent().find('li.cui-item-comment').fadeIn("slow");
    $(this).remove();
  });

  $(document).delegate('.cui-media-btns a', 'click', function (e) {
    e.preventDefault();
    var post_id = $(this).attr('href').split('=')[1].replace('&action', '');
    var $action = $(this).attr('href').split('=')[2];
    $('body').append('<div id="cui-overlay"></div>');
    $('body').append('<div id="cui-modal"></div>');
    $modalHtml = '<div id="cui-modal-wrap"><span id="cui-modal-close"></span><div id="cui-modal-header"><h3 id="cui-modal-title">Título</h3></div><div id="cui-modal-content"><p>Hola</p></div><div id="cui-modal-footer"><a id="cui-modal-ok-' + post_id + '" class="cui-modal-ok cui-modal-btn" href="#">' + CUI.accept + '</a><a class="cui-modal-cancel cui-modal-btn" href="#">' + CUI.cancel + '</a></div></div>';
    $("#cui-modal").append($modalHtml).fadeIn(250);

    switch ($action) {
      case 'url':
        $('#cui-modal').removeClass().addClass('cui-modal-url');
        $('#cui-modal-title').html(CUI.insertLink);
        $('#cui-modal-content').html('<input type="text" id="cui-modal-url-link" class="cui-modal-input" placeholder="' + CUI_WP.textUrlLink + '"/><input type="text" id="cui-modal-text-link" class="cui-modal-input" placeholder="' + CUI_WP.textToDisplay + '"/>');
        break;

      case 'image':
        $('#cui-modal').removeClass().addClass('cui-modal-image');
        $('#cui-modal-title').html(CUI.insertImage);
        $('#cui-modal-content').html('<input type="text" id="cui-modal-url-image" class="cui-modal-input" placeholder="' + CUI_WP.textUrlImage + '"/><div id="cui-modal-preview"></div>');
        break;

      case 'video':
        $('#cui-modal').removeClass().addClass('cui-modal-video');
        $('#cui-modal-title').html(CUI.insertVideo);
        $('#cui-modal-content').html('<input type="text" id="cui-modal-url-video" class="cui-modal-input" placeholder="' + CUI_WP.textUrlVideo + '"/><div id="cui-modal-preview"></div>');
        $('#cui-modal-footer').prepend('<a id="cui-modal-verifique-video" class="cui-modal-verifique cui-modal-btn" href="#">' + CUI.checkVideo + '</a>');
        break;
    }
  });//
  //acción Ok
  $(document).delegate('.cui-modal-ok', 'click', function (e) {
    e.preventDefault();
    $('#cui-modal input, #cui-modal textarea').removeClass('cui-error');
    var $action = $('#cui-modal').attr('class');
    var post_id = $(this).attr('id').replace('cui-modal-ok-', '');
    switch ($action) {
      case 'cui-modal-url':
        processUrl_CUI(post_id);
        break;
      case 'cui-modal-image':
        processImage_CUI(post_id);
        break;
      case 'cui-modal-video':
        processVideo_CUI(post_id);
        break;
    }
    autosize.update($('.cui-textarea'));
    closeModal_CUI();
    return false;
  });
  //eliminamos errores
  $(document).delegate('#cui-modal input, #cui-modal textarea', 'focus', function (e) {
    $(this).removeClass('cui-error');
  });

  function processUrl_CUI(post_id) {
    var $ok = true;
    var $urlField = $('#cui-modal-url-link');
    var $textField = $('#cui-modal-text-link');
    if ($urlField.val().length < 1) {
      $ok = false;
      $urlField.addClass('cui-error');
    }
    if ($textField.val().length < 1) {
      $ok = false;
      $textField.addClass('cui-error');
    }
    if ($ok) {
      var $urlVal = $urlField.val().replace(/https?:\/\//gi, '');
      var link_show_comments = '<a href="http://' + $urlVal + '" title="' + $textField.val() + '" rel="nofollow" target="_blank">' + $textField.val() + '</a>';
      insertInTextArea_CUI(post_id, link_show_comments);
    }
    return false;
  }

  function processImage_CUI(post_id) {
    var $ok = true;
    var $urlField = $('#cui-modal-url-image');
    if ($urlField.val().length < 1) {
      $ok = false;
      $urlField.addClass('cui-error');
    }
    if ($ok) {
      var $urlVal = $urlField.val();
      var $image = '<img src="' + $urlVal + '" />';
      insertInTextArea_CUI(post_id, $image);
    }
    return false;
  }

  //vista previa de imagen
  $(document).delegate('#cui-modal-url-image', 'change', function (e) {
    setTimeout(function () {
      $('#cui-modal-preview').html('<img src="' + $('#cui-modal-url-image').val() + '" />');
    }, 200);
  });

  function processVideo_CUI(post_id) {
    var $ok = true;
    var $urlField = $('#cui-modal-url-video');
    if (!$('#cui-modal-preview').find('iframe').length) {
      $ok = false;
      $('#cui-modal-preview').html('<p class="cui-modal-error">Please check the video url</p>');
    }
    if ($ok) {
      var $video = '<p>' + $('#cui-modal-preview').find('input[type="hidden"]').val() + '</p>';
      insertInTextArea_CUI(post_id, $video);
    }
    return false;
  }

  //vista previa de video
  $(document).delegate('#cui-modal-verifique-video', 'click', function (e) {
    e.preventDefault();
    var $urlVideo = $('#cui-modal-url-video');
    var $urlVideoVal = $urlVideo.val().replace(/\s+/g, '');
    $urlVideo.removeClass('cui-error');
    $(this).attr('id', '');//desactivamos el enlace

    if ($urlVideoVal.length < 1) {
      $urlVideo.addClass('cui-error');
      $('.cui-modal-video').find('a.cui-modal-verifique').attr('id', 'cui-modal-verifique-video');//activamos el enlace
      return false;
    }

    var data = 'url_video=' + $urlVideoVal;
    $.ajax({
      url: CUI.ajaxurl,
      data: data + '&action=verificar_video_CUI',
      type: "POST",
      dataType: "html",
      beforeSend: function () {
        $('#cui-modal-preview').html('<div class="cui-loading cui-loading-2"></div>');
      },
      success: function (data) {
        if (data != 'error') {
          $('#cui-modal-preview').html(data);
        } else {
          $('#cui-modal-preview').html('<p class="cui-modal-error">Invalid video url</p>');
        }
      },
      error: function (xhr) {
        $('#cui-modal-preview').html('<p class="cui-modal-error">Failed to process, try again</p>');
      },
      complete: function (jqXHR, textStatus) {
        $('.cui-modal-video').find('a.cui-modal-verifique').attr('id', 'cui-modal-verifique-video');//activamos el enlace
      }
    });//end ajax
  });

  function closeModal_CUI() {
    $('#cui-overlay, #cui-modal').remove();
    return false;
  }

  //acción cancelar
  $(document).delegate('#cui-modal-close, .cui-modal-cancel', 'click', function (e) {
    e.preventDefault();
    closeModal_CUI();
    return false;
  });

  function jPages_CUI(post_id, $numPerPage, $destroy) {
    //Si existe el plugin jPages y está activado
    if (typeof jQuery.fn.jPages == 'function' && CUI.jpages == 'true') {
      var $idList = 'cui-container-comment-' + post_id;
      var $holder = 'div.cui-holder-' + post_id;
      var num_comments = jQuery('#' + $idList + ' > li').length;
      if (num_comments > $numPerPage) {
        if ($destroy) {
          jQuery('#' + $idList).children().removeClass('animated jp-hidden');
        }
        jQuery($holder).jPages({
          containerID: $idList,
          previous: "← " + CUI_WP.textNavPrev,
          next: CUI_WP.textNavNext + " →",
          perPage: parseInt($numPerPage, 10),
          minHeight: false,
          keyBrowse: true,
          direction: "forward",
          animation: "fadeIn",
        });
      }//end if
    }//end if
    return false;
  }

  function captcha_CUI($max) {
    if (!$max) $max = 5;
    return {
      n1: Math.floor(Math.random() * $max + 1),
      n2: Math.floor(Math.random() * $max + 1),
    };
  }

  function scrollThis_CUI($this) {
    if ($this.length) {
      var $position = $this.offset().top;
      var $scrollThis = Math.abs($position - 200);
      $('html,body').animate({ scrollTop: $scrollThis }, 'slow');
    }
    return false;
  }

  function getUrlVars_CUI(url) {
    var query = url.substring(url.indexOf('?') + 1);
    var parts = query.split("&");
    var params = {};
    for (var i = 0; i < parts.length; i++) {
      var pair = parts[i].split("=");
      params[pair[0]] = pair[1];
    }
    return params;
  }

  function cancelCommentAction_CUI(post_id) {
    $('form#commentform-' + post_id).find('[name="comment_parent"]').val('0');
    $('form#commentform-' + post_id).find('.cui-textarea').val('').attr('placeholder', CUI.textWriteComment);
    $('form#commentform-' + post_id).find('input[name="submit"]').removeClass();
    $('form#commentform-' + post_id).find('input.cui-cancel-btn').hide();
    autosize.update($('#cui-textarea-' + post_id));
    $('input, textarea').removeClass('cui-error');
    captchaValues = captcha_CUI(9);
    $('.cui-captcha-text').html(captchaValues.n1 + ' &#43; ' + captchaValues.n2 + ' = ');
  }

  function restoreIframeHeight(wrapper) {
    var widthWrapper = CUI.widthWrap ? parseInt(CUI.widthWrap, 10) : wrapper.outerWidth();
    // if(widthWrapper >= 321 ) {
    // 	wrapper.find('iframe').attr('height','250px');
    // } else {
    // 	wrapper.find('iframe').attr('height','160px');
    // }
  }

  function rezizeBoxComments_CUI(wrapper) {
    var widthWrapper = CUI.widthWrap ? parseInt(CUI.widthWrap, 10) : wrapper.outerWidth();
    if (widthWrapper <= 480) {
      wrapper.addClass('cui-full');
    } else {
      wrapper.removeClass('cui-full');
    }
  }

  function insertInTextArea_CUI(post_id, $value) {
    //Get textArea HTML control
    var $fieldID = document.getElementById('cui-textarea-' + post_id);

    //IE
    if (document.selection) {
      $fieldID.focus();
      var sel = document.selection.createRange();
      sel.text = $value;
      return;
    }
    //Firefox, chrome, mozilla
    else if ($fieldID.selectionStart || $fieldID.selectionStart == '0') {
      var startPos = $fieldID.selectionStart;
      var endPos = $fieldID.selectionEnd;
      var scrollTop = $fieldID.scrollTop;
      $fieldID.value = $fieldID.value.substring(0, startPos) + $value + $fieldID.value.substring(endPos, $fieldID.value.length);
      $fieldID.focus();
      $fieldID.selectionStart = startPos + $value.length;
      $fieldID.selectionEnd = startPos + $value.length;
      $fieldID.scrollTop = scrollTop;
    }
    else {
      $fieldID.value += textArea.value;
      $fieldID.focus();
    }
  }

  // LIKE COMMENTS
  $(document).delegate('a.cui-rating-link', 'click', function (e) {
    e.preventDefault();
    var comment_id = $(this).attr('href').split('=')[1].replace('&method', '');
    var $method = $(this).attr('href').split('=')[2];
    commentRating_CUI(comment_id, $method);
    return false;
  });

  function commentRating_CUI(comment_id, $method) {
    var $ratingCount = $('#cui-comment-' + comment_id).find('.cui-rating-count');
    var $currentLikes = $ratingCount.text();
    jQuery.ajax({
      type: 'POST',
      url: CUI.ajaxurl,
      data: {
        action: 'comment_rating',
        comment_id: comment_id,
        method: $method,
        nonce: CUI.nonce
      },
      beforeSend: function () {
        $ratingCount.html('').addClass('cuio-loading');
      },
      success: function (result) {
        var data = $.parseJSON(result);
        if (data.success === true) {
          $ratingCount.html(data.likes).attr('title', data.likes + ' ' + CUI_WP.textLikes);
          if (data.likes < 0) {
            $ratingCount.removeClass().addClass('cui-rating-count cui-rating-negative');
          }
          else if (data.likes > 0) {
            $ratingCount.removeClass().addClass('cui-rating-count cui-rating-positive');
          }
          else {
            $ratingCount.removeClass().addClass('cui-rating-count cui-rating-neutral');
          }
        } else {
          $ratingCount.html($currentLikes);
        }
      },
      error: function (xhr) {
        $ratingCount.html($currentLikes);
      },
      complete: function (data) {
        $ratingCount.removeClass('cuio-loading');
      }//end success

    });//end jQuery.ajax
  }

  function clog(msg) {
    console.log(msg);
  }

  function cc(msg, msg2) {
    console.log(msg, msg2);
  }

  // show and hide note
  $(document).delegate('a.cui_note_button', 'click', function (e) {
    e.preventDefault();
    var note_area = $(this).closest('.cui-select-attending').find('.cui_note_texarea');
    note_area.toggleClass('active');
  })
});//end ready


function gotoTop() {
  var elmnt = document.getElementById("cui-box");
  elmnt.scrollTop = 0;
}


jQuery("document").ready(function () {
  // var iHeight = $("#cui-box").height();
  // $(this).addClass("jp-show");
  // $(this).removeClass("jp-hidden");

  // $('.li').removeClass('jp-hidden');
  // $('.li').addClass("jp-show");

  jQuery('.cui-container-comments li.comment').addClass('jp-show');
  // $(this).parent().addClass('jp-hidden');





  // var msg = 'DIV height is :<b> ' + iHeight + 'px</b> and ScrollHeight is :<b>' + iScrollHeight + 'px</b>';

  // $("span").html(msg);

});
