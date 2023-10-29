// Tables-DataTables.js
// ====================================================================
// This file should not be included in your project.
// This is just a sample how to initialize plugins or components.
//
// - ThemeOn.net -


$(window).on('load', function () {


    // DATA TABLES
    // =================================================================
    // Require Data Tables
    // -----------------------------------------------------------------
    // http://www.datatables.net/
    // =================================================================

    $.fn.DataTable.ext.pager.numbers_length = 5;


    // Add Row
    // -----------------------------------------------------------------
    var t = $('#demo-dt-addrow').DataTable({
        processing: true,//当表格在处理的时候（比如排序操作）是否显示“处理中...”,默认false
        serverSide: true,// 服务端分页
        searching: true,
        pageLength: 10,
        pagingType: "simple_numbers",
        ordering: false,// 排序功能
        responsive: true,
        info: true,
        // "lengthChange": true,
        // "lengthMenu": [10, 20, 100],
        language: {
            processing: "数据加载中...",
            infoEmpty: "无记录",
            info: "当前 _START_ 到 _END_ , 共 _TOTAL_ 条",
            paginate: {
                first: '首页',
                previous: '<i class="demo-psi-arrow-left"></i>',
                next: '<i class="demo-psi-arrow-right"></i>'
            }
        },
        dom: '<"newtoolbar">frtip',
        ajax: {
            url: '/api/mkslist',
            data: function (data) {
                console.log($.extend(data, {}))
                return {"draw": data.draw, "start": data.start, "length": data.length, "s": data.search.value}
            },
            type: 'GET',
            dateType: 'json',
            dataSrc: function (json) {
                for (var i = 0; i < json.page_list.length; i++){
                     if (json.page_list[i].specs !== '' && json.page_list[i].specs !== null) {
                         json.page_list[i]._specs = JSON.parse(json.page_list[i].specs)
                     }else {
                         json.page_list[i]._specs = null
                     }
                }
                return json.page_list
            }
        },
        columns: [
            {
                data: "pic",
                render: function (data, type, row, meta) {
                    return '<img src="' + row.pic +'"/>'
                }
            },
            {data: "name"},
            {data: "studio"},
            {
                data: "type",
                render: function (data, type, row, meta) {
                    return data == null ? '' : data
                }
            },
            {data: "manufacturer", defaultContent: ""},
            {data: "tag", defaultContent: ""},
            {
                render: function (data, type, row, meta) {
                    if (row._specs == null) {
                        return ''
                    }
                    return '<div>触发压力: ' + row._specs.actuation_force + '±' + row._specs.actuation_force_p + 'g<div/>'
                        + '<div>触发行程: ' + row._specs.pre_travel + '±' + row._specs.pre_travel_p + 'mm<div/>'
                        + '<div>触底压力: ' + row._specs.end_force + '±' + row._specs.end_force_p + 'g<div/>'
                        + '<div>触底行程: ' + row._specs.total_travel + '±' + row._specs.total_travel_p + 'mm<div/>'
                }
            },
            {
                render: function (data, type, row, meta) {
                    if (row._specs == null) {
                        return ''
                    }
                    return '<div>上盖: ' + row._specs.top + '</div>'
                        + '<div>底壳: ' + row._specs.bottom + '</div>'
                        +'<div>轴心: ' + row._specs.stem + '</div>'
                        + '<div>弹簧: ' + row._specs.spring +'</div>'
                }
            },
            {
                render: function (data, type, row, meta) {
                    if (row._specs == null) {
                        return ''
                    }
                    return '<span>' + row._specs.pin + ',' + row._specs.light_pipe +'导光柱</span>'
                }
            },
            {data: "quantity", defaultContent: ""},
            {data: "price", defaultContent: ""},
            {data: "create_time"},
            {data: null}
        ],
        columnDefs: [
            {
                targets: [-1],
                render: function (data, type, row, meta) {
                    var jumpUrl = '/p/mks/' + row.id
                    return '<a href="' +  jumpUrl + '" target="_blank"><button class="btn btn-xs btn-default">编辑</button></a>'
                }
            }
        ]
    });
    $('#demo-custom-toolbar2').appendTo($("div.newtoolbar"));

    $('#refresh-btn').click(function(){
        t.ajax.reload();
    });

    $('#demo-dt-addrow-btn1111').on('click', function () {
        t.row.add([
            'Adam Doe',
            'New Row',
            'New Row',
            2,
            '2015/10/15',
            '$2,000'
        ]).draw();
    });


});
