<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta charset="utf-8" />
        <style type="text/css">
          body { font-family: Arial, sans-serif; font-size:14px; color:#333; margin:16px; }
          h1 { font-size:20px; margin:0 0 8px; }
          .desc { color:#666; margin-bottom:16px; }
          table { width:100%; border-collapse: collapse; }
          th, td { text-align:left; padding:8px; border-bottom:1px solid #e5e5e5; }
          th { background:#f7f7f7; font-weight:600; }
          tr:hover { background:#fafafa; }
          a { color:#1976d2; text-decoration:none; }
          a:hover { text-decoration:underline; }
          .muted { color:#999; }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <div class="desc">
          This sitemap contains <strong><xsl:value-of select="count(s:urlset/s:url)"/></strong> URLs.
        </div>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
          </tr>
          <xsl:for-each select="s:urlset/s:url">
            <tr>
              <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
              <td>
                <xsl:choose>
                  <xsl:when test="string-length(normalize-space(s:lastmod)) &gt; 0">
                    <xsl:value-of select="s:lastmod"/>
                  </xsl:when>
                  <xsl:otherwise><span class="muted">-</span></xsl:otherwise>
                </xsl:choose>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
