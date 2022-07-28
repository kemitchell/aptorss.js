#!/usr/bin/env node
const hub = process.argv[2]
const cheerio = require('cheerio')

const query = `https://apnews.com/hub/${hub}`

require('https').get(query, response => {
  const chunks = []
  response
    .on('data', chunk => chunks.push(chunk))
    .once('error', error => {
      console.error(error)
      process.exit(1)
    })
    .once('end', () => {
      outputRSS(Buffer.concat(chunks).toString('utf8'))
    })
})

function outputRSS (html) {
  const $ = cheerio.load(html)
  const title = $('h1[data-key=hub-title]').text()
  const date = $('span[data-key=timestamp]').attr('data-source')
  console.log('<?xml version="1.0" encoding="UTF-8"?>')
  console.log('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
  console.log('<channel>')
  tag('title', `AP News Hub ${title}`)
  tag('link', 'https://hn.kemitchell.com')
  $('.FeedCard').each(function () {
    const title = $('h2', this).text()
    const href = $('a[data-key=card-headline]', this).attr('href')
    const description = $('.content p', this).text()
    console.log('<item>')
    tag('title', title)
    tag('link', `https://apnews.com/${href}`)
    tag('description', description)
    tag('pubDate', date)
    console.log('</item>')
  })
  console.log('</channel>')
  console.log('</rss>')
}

function tag (name, string) {
  console.log(`<${name}>${escapeXML(string)}</${name}>`)
}

function escapeXML (string) {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
