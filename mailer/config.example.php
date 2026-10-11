<?php
return [
  'smtp' => [
    'host' => 'smtp.gmail.com',
    'port' => 587,
    'encryption' => 'tls', 
    'username' => '',
    'password' => '',
    'from_email' => '',
    'from_name'  => 'Grand Ontama'
  ],
  'to' => [
    'email' => '', 
    'name'  => 'Tim Marketing Grand Ontama'
  ],
  'recaptcha' => [
    'site_key'   => '',
    'secret_key' => '',
    'min_score'  => 0.5
  ],
  'rate_limit' => [
    'max_per_hour' => 50
  ]
];
