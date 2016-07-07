<?php
set_time_limit(300);

$json = json_decode(file_get_contents("./json/gems.json"));

foreach ($json as &$item) {

  $data_string = 'league=Prophecy&type=&base=&name='.$item->name.'&dmg_min=&dmg_max=&aps_min=&aps_max=&crit_min=&crit_max=&dps_min=&dps_max=&edps_min=&edps_max=&pdps_min=&pdps_max=&armour_min=&armour_max=&evasion_min=&evasion_max=&shield_min=&shield_max=&block_min=&block_max=&sockets_min=&sockets_max=&link_min=&link_max=&sockets_r=&sockets_g=&sockets_b=&sockets_w=&linked_r=&linked_g=&linked_b=&linked_w=&rlevel_min=&rlevel_max=&rstr_min=&rstr_max=&rdex_min=&rdex_max=&rint_min=&rint_max=&mod_name=&mod_min=&mod_max=&group_type=And&group_min=&group_max=&group_count=1&q_min=&q_max=&level_min=&level_max=&ilvl_min=&ilvl_max=&rarity=&seller=&thread=&identified=&corrupted=&online=x&buyout=x&altart=&capquality=x&buyout_min=&buyout_max=&buyout_currency=&crafted=&enchanted=Name';
                    
  $ch = curl_init('http://poe.trade/search');
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");                                                                     
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);                                                                  
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array(    
      'Content-Type: application/json',          
      'Content-Length: ' . strlen($data_string)) 
  );
                                                 
  $result = curl_exec($ch);
  $redirect_url = curl_getinfo($ch, CURLINFO_REDIRECT_URL);

  $item->poeTradeUrl = $redirect_url;
  echo $item->name . ' - ' . $item->poeTradeUrl . "\r\n";
}

$parsed_json = json_encode($json);
$parsed_json = str_replace('\/', '/', $parsed_json);

$fp = fopen('results.json', 'w');
fwrite($fp, $parsed_json);
fclose($fp);
