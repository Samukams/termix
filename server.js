const express = require("express");

const { Pool } = require("pg");

const app = express();

app.use(express.static("public"));

app.use(express.json());

const pool = new Pool({

    user:"postgres",

    host:"localhost",

    database:"termix",

    password:"senai",

    port:5432

});

pool.connect((err)=>{

    if(err){

        console.log(
            "Erro PostgreSQL:",
            err
        );

        return;

    }

    console.log(
        "PostgreSQL conectado 🔥"
    );
    
});

app.get("/word", async (req,res)=>{

    try{

        const result =
        await pool.query(

            "SELECT palavra FROM respostas ORDER BY RANDOM() LIMIT 1"

        );

        if(result.rows.length === 0){

            return res.json({

                word:"TERMO"

            });

        }

        res.json({

            word:
            result.rows[0]
            .palavra

        });

    }

    catch(err){

        res.status(500)
        .json(err);

    }

});

app.get("/check/:word", async (req,res)=>{

    try{

        const word =
        req.params.word.toUpperCase();

        const result =
        await pool.query(

            "SELECT * FROM palavras WHERE UPPER(palavra)=$1",

            [word]

        );

        res.json({

            exists:
            result.rows.length > 0

        });

    }

    catch(err){

        res.status(500)
        .json(err);

    }

});

app.post("/save-score", async (req,res)=>{

    try{

        const {

            nome,
            modo,
            tempo,
            tentativas,
            venceu

        } = req.body;

        let player =
        await pool.query(

            "SELECT * FROM players WHERE nome=$1",

            [nome]

        );

        let playerId;

        if(player.rows.length === 0){

            const newPlayer =
            await pool.query(

                `INSERT INTO players
                (
                    nome,
                    vitorias,
                    derrotas,
                    partidas
                )
                VALUES($1,0,0,0)
                RETURNING *`,

                [nome]

            );

            playerId =
            newPlayer.rows[0].id;

            player =
            newPlayer;

        }

        else{

            playerId =
            player.rows[0].id;

        }

        await pool.query(

            `INSERT INTO matches
            (
                player_id,
                modo,
                tempo,
                tentativas,
                venceu
            )
            VALUES($1,$2,$3,$4,$5)`,

            [
                playerId,
                modo,
                tempo,
                tentativas,
                venceu
            ]

        );

        if(venceu){

            await pool.query(

                `UPDATE players
                SET
                vitorias = vitorias + 1,
                partidas = partidas + 1
                WHERE id=$1`,

                [playerId]

            );

            if(modo === "medium"){

                await pool.query(

                    `UPDATE players
                    SET melhor_tempo_medio =
                    CASE
                    WHEN melhor_tempo_medio IS NULL
                    OR $1 < melhor_tempo_medio
                    THEN $1
                    ELSE melhor_tempo_medio
                    END
                    WHERE id=$2`,

                    [tempo,playerId]

                );

            }

            if(modo === "hard"){

                await pool.query(

                    `UPDATE players
                    SET melhor_tempo_dificil =
                    CASE
                    WHEN melhor_tempo_dificil IS NULL
                    OR $1 < melhor_tempo_dificil
                    THEN $1
                    ELSE melhor_tempo_dificil
                    END
                    WHERE id=$2`,

                    [tempo,playerId]

                );

            }

        }

        else{

            await pool.query(

                `UPDATE players
                SET
                derrotas = derrotas + 1,
                partidas = partidas + 1
                WHERE id=$1`,

                [playerId]

            );

        }

        res.json({

            success:true

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json(err);

    }

});

app.get("/ranking", async (req,res)=>{

    try{

        const geral =
        await pool.query(

            `SELECT nome,vitorias
            FROM players
            ORDER BY vitorias DESC
            LIMIT 10`

        );

        const medio =
        await pool.query(

            `SELECT nome,melhor_tempo_medio
            FROM players
            WHERE melhor_tempo_medio IS NOT NULL
            ORDER BY melhor_tempo_medio ASC
            LIMIT 10`

        );

        const dificil =
        await pool.query(

            `SELECT nome,melhor_tempo_dificil
            FROM players
            WHERE melhor_tempo_dificil IS NOT NULL
            ORDER BY melhor_tempo_dificil ASC
            LIMIT 10`

        );

        res.json({

            geral:geral.rows,

            medio:medio.rows,

            dificil:dificil.rows

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json(err);

    }

});

app.get("/player/:name", async (req,res)=>{

    try{

        const result =
        await pool.query(

            `SELECT *
            FROM players
            WHERE nome=$1`,

            [req.params.name]

        );

        res.json(

            result.rows[0]

        );

    }

    catch(err){

        res.status(500).json(err);

    }

});

app.listen(3000,()=>{

    console.log(

        "Servidor rodando em http://localhost:3000"

    );

});