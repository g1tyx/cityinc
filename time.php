<?php
//抓取请求源的域名
$origin_source = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';    
//配置请求源白名单
$white_list = array(    
    'http://likexia.gitee.io',
	'https://likexia.gitee.io',
	'http://zhaolinxu.github.io',
    'https://zhaolinxu.github.io',
    'https://yx.g8hh.com',
    'http://gityx.com'
);
if(in_array($origin_source, $white_list)){    
    header("Access-Control-Allow-Origin:{$origin_source}");    
	header("Access-Control-Allow-Credentials:true");
    header("Access-Control-Allow-Methods:GET,POST,OPTIONS");    
    header("Access-Control-Allow-Headers:x-requested-with,content-type");
	echo time();	
}
else{
	echo "Get the fuck off!!!";
}