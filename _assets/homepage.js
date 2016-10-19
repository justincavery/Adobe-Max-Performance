"use strict";var pairs=location.search.slice(1).split("&"),query_string={};pairs.forEach(function(pair){pair=pair.split("="),query_string[pair[0]]=decodeURIComponent(pair[1]||"")});var pages=["usa","germany","australia","japan"],marqueeImages=["/_assets/images/marquees/max-marquee-home-desktop.jpg","/_assets/images/marquees/max-marquee-2-home-desktop.jpg","/_assets/images/marquees/max-marquee-3-home-desktop.jpg","/_assets/images/marquees/max-marquee-4-home-desktop.jpg"],artist=["Victoria Siemer, USA","Patrick Monatsberger, Germany","Lauren Bath, Australia","Takashi Yasui, Japan"],attribution=["https://www.behance.net/witchoria","https://www.behance.net/moners_","https://www.behance.net/laurenepbath","https://www.behance.net/takashiyasui"];$(document).ready(function(){var page="";"page"in query_string?(page=pages.indexOf(query_string.page),-1==page&&(page=0)):page=Math.floor(4*Math.random()),$("#homepage-marquee-image").attr("src",marqueeImages[page]),$(".homepage-marquee .behance .artist a").html(artist[page]),$(".homepage-marquee a").attr("href",attribution[page]),$(".homepage-marquee").removeClass("hide").fadeIn("slow"),$("#home-video-modal").on("open.zf.reveal",function(){$("#home-video-desktop").get(0).play()}),$("#home-video-modal").on("closed.zf.reveal",function(){$("#home-video-desktop").get(0).pause()})});