const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParse = require("body-parser");
const dotenv = require("dotenv");
const cheerio = require("cheerio");
const url = "https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki"
const urlCharater = "https://kimetsu-no-yaiba.fandom.com/wiki/"
//Set up
const app = express();
app.use(bodyParse.json({ limit: "50mb" }));
app.use(cors());
dotenv.config();
app.use(
    bodyParse.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
    })
)

//Router
app.get("/v1", (req, resp) => {
    const results = [];
    const limit = Number(req.query.limit);
    try {
        axios(url).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);

            $(".portal", html).each(function () {
                const name = $(this).find("a").attr("title");
                const url = $(this).find("a").attr("href");
                const img = $(this).find("a > img").attr("data-src");
                results.push({ name, url: "https://localhost:3001/v1" + url.split('/wiki')[1], img });
            })
            if (limit && limit > 0) {
                resp.status(200).json(results.slice(0, limit));
            }
            else {
                resp.status(200).json(results);
            }
        })
    }
    catch {
        resp.status(500).json(err);
    }
})

//Get a Character
app.get("/v1/:character", (req, resp) => {
    let url = urlCharater + req.params.character;
    const galleries = [];
    const titleCharacter = [];
    const details = [];
    const characterObj = [];
    const characters = [];
    try {
        axios(url).then((res) => {
            const html = res.data;
            const $ = cheerio.load(html);
            $(".wikia-gallery-item", html).each(function () {
                const gallery = $(this).find("a > img").attr("data-src");
                galleries.push(gallery);
            })
            $("aside", html).each(function () {
                const title = $(this).find("tbody > tr > td > i").text();
                const image = $(this).find("img").attr("src");
                $(this).find("section > div > h3").each(function () {
                    titleCharacter.push($(this).text());
                });
                $(this).find("section > div > div").each(function () {
                    details.push($(this).text());
                });
                // titleCharacter.push(title);
                // details.push(details)
                if (image !== undefined) {
                    for (let i = 0; i < titleCharacter.length; i++) {
                        characterObj[titleCharacter[i].toLowerCase()] = details[i];
                    }
                    characters.push({
                        name: req.params.character.replace("_", "-"),
                        galleries: galleries,
                        image: image,
                        ...characterObj,
                    });
                }
                console.log(characters);
            });
            resp.status(200).json(characters);
        });
    }
    catch (err) {
        resp.status(500).json(err);
    }
});

//Run
const port = 3001;
app.listen(3001, () => {
    console.log(`Server is running on ${port}`);
})

