




 $(document).ready(function() {

     // var myData = [];
     // $('#studio-inputnormal').typeahead({
     //     source: function (query, process) {
     //         if (myData.length === 0) {
     //             $.get('/api/keyword?t=studio', function (data, status) {
     //                 myData = data
     //             })
     //         }
     //         return process(myData)
     //     }
     // });

     // var logos = []
     // $('#logo-input').typeahead({
     //     source: function (query, process) {
     //         if (myData.length === 0) {
     //             $.get('/api/keyword?t=logo', function (data, status) {
     //                 myData = data
     //             })
     //         }
     //         return process(myData)
     //     }
     // })
    $('#demo-default-modal').on('show.bs.modal', function(){
        $.ajax({
            url: '/api/page_temp_image',
            method: 'GET',
            success: function (data) {
                var html = ''
                data.forEach((item, index) => {
                    let _m = '/bfs/t/' + item
                    html += '<option value="' + _m + '">' + _m + '</option>'
                });
                $('#cloudImageSelect').html(html)
            }
        });
     })
    $('#main-pic-img').click(function(){
        $('#demo-default-modal').modal('show');
    })

     $('#cancel-btn').click(function (){
         window.location.replace('/control/main')
     })

    let uploadType = 1;

     var simplemde = new SimpleMDE({
         element: document.getElementById("editor"),
         insertTexts: {
           image: ["![](", ")"],
         },
         toolbar: [
             {
                 name: 'bold',
                 action: SimpleMDE.toggleBold,
                 className: "fa fa-bold",
                 title: "粗体",
             },
             {
                 name: 'italic',
                 action: SimpleMDE.toggleItalic,
                 className: 'fa fa-italic',
                 title: '斜体'
             },
             '|',
             {
                 name: 'link',
                 action: SimpleMDE.drawLink,
                 className: 'fa fa-link',
                 title: '链接'
             },
             {
                 name: 'image',
                 action: SimpleMDE.drawImage,
                 className: 'fa fa-picture-o',
                 title: '图片'
             },
             '|',
             {
                 name: 'preview',
                 action: SimpleMDE.togglePreview,
                 className: 'fa fa-eye no-disable',
                 title: '预览'
             },
             {
                 name: 'side-by-side',
                 action: SimpleMDE.toggleSideBySide,
                 className: 'fa fa-columns no-disable no-mobile',
                 title: '预览模式'
             },
             {
                 name: 'fullscreen',
                 action: SimpleMDE.toggleFullScreen,
                 className: 'fa fa-arrows-alt no-disable no-mobile',
                 title: '全屏'
             },
             '|',
             {
                 name: 'custom',
                 action: function customFunction(editor) {
                     uploadType = 2
                     editor.drawImage()
                     $('#demo-default-modal').modal('show')
                 },
                 className: 'fa fa-unsorted',
                 title: '插入图片'
             }
         ]
     });
     simplemde.value($('#desc-input').val())
     $('#save-btn').click(function () {
         console.log(simplemde.markdown(simplemde.value()))
         let af_tol = $('#act-force-p-input').val()
         let ef_tol = $('#end-force-p-input').val()
         let pt_tol = $('#pre-travel-p-input').val()
         let tt_tol = $('#total-travel-p-input').val()
         const data = {
             id: $('#id-input').val(),
             name: $('#name-inputsmall').val(),
             pic: $('#main-pic-img').attr('src'),
             studio: $('#studio-inputnormal').val(),
             manufacturer: $('#manufacturer-select').val(),
             type: $('#type-select').val(),
             num: $('#numInput').val(),
             price: $('#price-input').val(),
             desc: simplemde.value(),
             stor_loc_box: $('#storBoxSelect').find("option:selected").val(),
             stor_loc_row: $('#storRowInput').val(),
             stor_loc_col: $('#storColInput').val(),
             mark: $('#markInput').val(),
             actuation_force: $('#act-force-input').val(),
             actuation_force_tol: af_tol === '±' ? '' : af_tol,
             bottom_force: $('#end-force-input').val(),
             bottom_force_tol: ef_tol === '±' ? '' : ef_tol,
             pre_travel: $('#pre-travel-input').val(),
             pre_travel_tol: pt_tol === '±' ? '' : pt_tol,
             total_travel: $('#total-travel-input').val(),
             total_travel_tol: tt_tol === '±' ? '' : tt_tol,
             pins: $('input[name=pin-inline-form-radio]:checked').val(),
             top_mat: $('#top-input').val(),
             bottom_mat: $('#bottom-input').val(),
             stem_mat: $('#stem-input').val(),
             spring: $('#spring-inputlarge').val(),
             light_style: $('#light_styleInput').val(),
         }
         const params = Object.entries(data).reduce((acc, [key, value]) => {
            if (value && value !== '') {
              acc[key] = value;
            }
            return acc;
          }, {});
         console.log(params)
         $.ajax({
             type: 'POST',
             url: '/api/v2/switches',
             contentType: 'application/json',
             data: JSON.stringify(params),
             dataType: 'json',
             success: function (data) {
                 console.log(data)
                 if (data.status === 'ok') {
                     window.location.replace('/control/main')
                 }else {
                    $.niftyNoty({
                        type: 'danger',
                        icon : 'pli-cross icon-2x',
                        message : '保存失败: <strong>' + data.msg +'</strong>',
                        container : 'floating',
                        timer : 5000
                    });
                 }
                 // window.location.href = ''
             },
             error: function (err) {
                 console.log(err)
                 $.niftyNoty({
                        type: 'danger',
                        icon : 'pli-cross icon-2x',
                        message : '保存失败',
                        container : 'floating',
                        timer : 5000
                    });
             }
         })
     })

    //  $('#paste-btn').click(function (){
    //      getClipboardContents()
    //  })

    //  async function getClipboardContents() {
    //      try {
    //          const clipboardItems = await navigator.clipboard.read()
    //          console.log(clipboardItems)
    //          for (let clipboardItem of clipboardItems) {
    //              for (const type of clipboardItem.types) {
    //                  if (type.indexOf('image') >= 0) {
    //                      const blob = await clipboardItem.getType(type)
    //                      if (blob) {
    //                          var reader = new FileReader()
    //                          reader.readAsDataURL(blob)
    //                          reader.onload = function (evt) {
    //                              $('#cropper-main-pic-img').attr('src', evt.target.result)
    //                          }
    //                      }
    //                  }
    //              }
    //          }
    //      } catch (err) {
    //          console.log(err.name, err.message);
    //      }
    //  }

    var cropper = null
     $('#direct-use-btn').click(function () {
         if (cropper !== null) {
             $.niftyNoty({type: 'danger', icon : 'pli-cross icon-2x', message : '裁切状态无法直接使用', container : 'floating', timer : 2000});
             return;
         }
         let url = $('#cropper-main-pic-img').attr('src')
         if (url === '') {
             $.niftyNoty({type: 'waring', icon : 'pli-cross icon-2x', container : 'floating', timer : 2000,
                 message : '图片不存在'
             });
             return
         }
         $.ajax({type: 'POST', url: '/api/direct_use_pic',
             contentType: 'application/json',
             data: JSON.stringify({url: url}),
             dataType: 'json',
             success: function (data) {
                 if (data.status === 'ok') {
                     if (uploadType === 1) {
                         $('#main-pic-img').attr('src', data.data)
                     } else{
                         simplemde.value(simplemde.value().replaceAll('![]()', '\n![](' + data.data + ')\n'))
                         // simplemde.value(simplemde.value() + '\n![](' + data.data + ')')
                     }
                     $('#download-pic-input').val('')
                     $('#cropper-main-pic-img').attr('src', '')
                     $('#demo-default-modal').modal('hide')
                     uploadType = 1
                 } else {
                     $.niftyNoty({type: 'danger', icon : 'pli-cross icon-2x', message : '系统错误: <strong>' + data.msg +'</strong>', container : 'floating', timer : 2000});
                 }
             },
             error: function (err) {
                 console.log(err)
                 $.niftyNoty({type: 'danger', icon : 'pli-cross icon-2x', message : '系统错误', container : 'floating', timer : 2000});
             }
         })
     })



//https://www.ruanyifeng.com/blog/2021/01/clipboard-api.html
     //https://blog.csdn.net/qq_23521659/article/details/108048570
     // document.addEventListener('paste', function (e){
     //     var cbd = e.clipboardData
     //     console.log(cbd)
     //     for (var i = 0; i < cbd.items.length; i++){
     //        console.log(cbd.items[i])
     //         var item = cbd.items[i]
     //         if (item.kind === 'file') {
     //             var blob = item.getAsFile()
     //             if (blob.size === 0) {
     //                 return;
     //             }
     //             if (blob) {
     //                 var reader = new FileReader()
     //                 reader.readAsDataURL(blob)
     //                 reader.onload=function (evt) {
     //                     $('#cropper-main-pic-img').attr('src', evt.target.result)
     //                 }
     //             }
     //         }
     //     }
     // }, false)

     $('#download-pic-btn').click(function (event) {
         const url = $('#download-pic-input').val()
         $.ajax({
             type: 'POST',
             url: '/api/download_pic',
             contentType: 'application/json',
             data: JSON.stringify({url: url}),
             dataType: 'json',
             success: function (data) {
                 $('#cropper-main-pic-img').attr('src', data.data)
             },
             error: function (err) {
                 console.log(err)
             }
         })
     });



     $('#cropper-btn').click(function () {
         if (cropper !== null) {
             cropper.destroy()
             cropper = null
         }
         initcropper()
     })


     function initcropper(){
         let aspectRatio;
         if (uploadType === 1) {
             aspectRatio = 13 / 10
         }
         cropper = new Cropper(document.getElementById('cropper-main-pic-img'),
         {
             aspectRatio: aspectRatio,
             viewMode: 1,
             preview:'.small',//开启预览效果
             dragMode:'move',//参数：move-能够移动图片和框，crop-拖拽新建框
             modal:true,//是否开启遮罩，将未选中的地方暗色处理
             guides:true,//是否显示裁剪的虚线
             highlight:true,//将选中的区域亮色处理
             background:true,//是否显示网格背景
             center:true,//裁剪框是否在图片的中心
             autoCrop:true,//当初始化的时候（是否自动显示裁剪框）.
             autoCropArea:0.8,//当初始化时，裁剪框的大小与原图的比例 0.8是默认，1是1比1
             zoomable:true,//是否能够缩放图片 false为不能放大缩小
             zoomOnTouch:true,//是否能够经过触摸的形式来放大图片(手机端)
             zoomOnWheel:true,//是否容许用鼠标来放大货缩小图片
             wheelZoomRatio:0.2,//设置鼠标控制缩放的比例
             cropBoxMovable:true,//是否能够移动裁剪框 裁剪框不动，图片动。当movable:true
             cropBoxResizable:true,//是否能够调整裁剪框的大小，默认true
             crop: function (event) {
                // console.log(event)
             },
         })
         console.log('cropper init' + cropper)
     }

     $('#confirm-cropper-btn').click(function (){
         if (cropper === null) {
             $.niftyNoty({type: 'danger', icon : 'pli-cross icon-2x', message : '请先裁切', container : 'floating', timer : 2000});
             return;
         }
         cropper.getCroppedCanvas().toBlob((blob) => {
             const formData = new FormData();
             formData.append('image', blob/*, 'example.png' */);
             $.ajax('/api/upload_pic', {
                 method: 'POST',
                 data: formData,
                 processData: false,
                 contentType: false,
                 success(data) {
                     if (uploadType === 1) {
                         $('#main-pic-img').attr('src', data.data)
                     } else{
                         simplemde.value(simplemde.value().replaceAll('![]()', '\n![](' + data.data + ')\n'))
                     }
                     $('#download-pic-input').val('')
                     $('#cropper-main-pic-img').attr('src', '')
                     $('#demo-default-modal').modal('hide')
                     uploadType = 1
                 },
                 error(err) {
                     console.log(err);
                 },
             });
         });
         cropper.destroy()
         cropper = null
     })

     $('#demo-default-modal').on('hidden.bs.modal', function () {
         if (cropper){
             cropper.destroy()
             cropper = null
         }
         uploadType = 1
         simplemde.value(simplemde.value().replaceAll('![]()', ''))
     })

     $(document).on('change', '#cloudImageSelect', function(){
        $('#cropper-main-pic-img').attr('src', $(this).val())
     });

     $('#choosePicBtn').click(function(){
        $('#cropper-main-pic-img').attr('src', $('#cloudImageSelect').val())
     })

     $('#storBoxSelect').on('changed.bs.select', function (e) {
         let nowValue = $('#markInput').val()
         console.log(nowValue)
         if (nowValue !== '') {
             return;
         }
         if ($(this).val().indexOf('J.') >= 0) {//精微科
             $('#markInput').val('无')
         } else if ($(this).val().indexOf('G.') >= 0) {
             $('#markInput').val('GATERON')
         }else if ($(this).val().indexOf('C.') >= 0) {
             $('#markInput').val('TTC')
         }else if ($(this).val().indexOf('T.') >= 0) {
             $('#markInput').val('Tecsee')
         }else if ($(this).val().indexOf('I.') >= 0) {//禾金
             $('#markInput').val('无')
         }else if ($(this).val().indexOf('U.') >= 0) {//雷创
             $('#markInput').val('无')
         }else if ($(this).val().indexOf('O.') >= 0) {
             $('#markInput').val('OUTEMU')
         }else if ($(this).val().indexOf('X.') >= 0) {//HMX
             $('#markInput').val('无')
         }else if ($(this).val().indexOf('H.') >= 0) {
             $('#markInput').val('HUANO')
         }else if ($(this).val().indexOf('K.') >= 0) {
             $('#markInput').val('Kailh')
         }else if ($(this).val().indexOf('Q.') >= 0) {//ktt
             $('#markInput').val('爪')
         }else if ($(this).val().indexOf('E.') >= 0) {
             $('#markInput').val('LEOBOG')
         }else if ($(this).val().indexOf('M.') >= 0) {
             $('#markInput').val('')
         }else if ($(this).val().indexOf('L.') >= 0) {
             $('#markInput').val('LICHICX')
         } else if ($(this).val().indexOf('Z.') >= 0) {
             $('#markInput').val('JERRZI')
         } else if ($(this).val().indexOf('B.') >= 0) {
             $('#markInput').val('BSUN YOK')
         }else if ($(this).val().indexOf('Y.') >= 0) {//键极客
             $('#markInput').val('')
         }else if ($(this).val().indexOf('A.') >= 0) {//金橙
             $('#markInput').val('')
         }else if ($(this).val().indexOf('S.') >= 0) {
             $('#markInput').val('SWK')
         }
     })

 })
