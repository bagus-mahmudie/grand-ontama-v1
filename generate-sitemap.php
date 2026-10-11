<?php

$DOMAIN = 'https://grandontama.com';
$ROOT = __DIR__;

$excludeFiles = [
    'navbar.html',
    'footer.html',
];

$htmlFiles = glob($ROOT . '/*.html');

$urls = [];

foreach ($htmlFiles as $file) {
    $filename = basename($file);

    if (in_array($filename, $excludeFiles, true)) {
        continue;
    }

    if ($filename === 'beranda.html') {
        $slug = '';
        $priority = '1.0';
    } else {
        $slug = preg_replace('/\.html$/', '', $filename);
        $priority = getPriority($slug);
    }

    $lastmod = date('Y-m-d', filemtime($file));

    $urls[] = [
        'loc' => rtrim($DOMAIN . '/' . $slug, '/'),
        'lastmod' => $lastmod,
        'priority' => $priority,
    ];
}

usort($urls, function ($a, $b) {
    return strcmp($a['loc'], $b['loc']);
});

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>' . PHP_EOL;
$xml .= '<urlset' . PHP_EOL;
$xml .= '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . PHP_EOL;
$xml .= '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' . PHP_EOL;
$xml .= '  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . PHP_EOL;

foreach ($urls as $url) {
    $xml .= '  <url>' . PHP_EOL;
    $xml .= '    <loc>' . htmlspecialchars($url['loc'], ENT_XML1, 'UTF-8') . '</loc>' . PHP_EOL;
    $xml .= '    <lastmod>' . htmlspecialchars($url['lastmod'], ENT_XML1, 'UTF-8') . '</lastmod>' . PHP_EOL;
    $xml .= '    <priority>' . htmlspecialchars($url['priority'], ENT_XML1, 'UTF-8') . '</priority>' . PHP_EOL;
    $xml .= '  </url>' . PHP_EOL;
}

$xml .= '</urlset>' . PHP_EOL;

file_put_contents($ROOT . '/sitemap.xml', $xml);

echo "Sitemap berhasil dibuat: " . count($urls) . " URL" . PHP_EOL;

function getPriority($slug)
{
    $highPriority = [
        'luxora',
        'melodia',
        'rumah-dijual',
        'verona',
    ];

    $mediumPriority = [
        'blogs',
        'harga-pasaran-rumah-2026',
        'mimpi-beli-rumah',
        'pajak-jual-beli-rumah',
        'tentang-kami',
        'tips-jual-rumah',
    ];

    if (in_array($slug, $highPriority, true)) {
        return '0.9';
    }

    if (in_array($slug, $mediumPriority, true)) {
        return '0.8';
    }

    return '0.7';
}