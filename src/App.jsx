import './App.css'
import axios from 'axios';
import { useState } from 'react';

function App() {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');
  const [pokeType, setPokeType] = useState('');

  if (status === 'success') {
    return <h1 className="celebrate-heading">You Win!</h1>
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitForm(answer, pokeType);
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  }
  function handleTextareaChange(e) {
    setAnswer(e.target.value);
  }


  return (
    <>
      <h1>Poketype Quiz</h1>
      <p>
        What type is it?
      </p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={handleTextareaChange}
          disabled={status === 'submitting'}
        />
        <br />
        <button disabled={
          answer.length === 0 ||
          status === 'submitting'
        }>
          Submit
        </button>
        {error !== null &&
          <p className="Error">
            {error.message}
          </p>
        }
      </form>

      <div className="card">
        <button onClick={() => getPokemon(setPokeType)}>
          I'm Feeling Lucky
        </button>

      </div>
      <div id="pokemonSprites"></div>
      <div className="slot-machine">
      <div className="slot" id="slot1"></div>
      <div className="slot" id="slot2"></div>
      <div className="slot" id="slot3"></div>
      <div className="slot" id="slot4"></div>
      <div className="slot" id="slot5"></div>
      <div className="slot" id="slot6"></div>
      </div>
    </>
  )
}

const getPokemon = async (setPokeType) => {
  try{
    const getRandomPokemonId = Math.floor(Math.random() * 898 + 1);
    //random pokemon id
    const randomPokemonData = await getPokemonDataForId(getRandomPokemonId)
    //data from pokemon id
    console.log(randomPokemonData)
    const pokeType = randomPokemonData.types.map(type => type.type.name)[0];
    //type mapped from data
    console.log(pokeType)
    //set poketype state
    setPokeType(pokeType);
    const targetPokemonData = await getPokemonDataForType(pokeType)
    //data from 5 others where type is the same
    console.log(targetPokemonData)
    displayPokemonSprites(targetPokemonData)
  } catch (error) {
    console.log("Error:", error)
  }
}

const getPokemonDataForId = async(id) => {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = response.data;
    return data
}

const getPokemonDataForType = async(type) => {
  const response = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
      const data = response.data;
      const pokemonCount = data.pokemon.length;
      //max number 
      const randomIds = [];
      //list of nums to request data for
      while (randomIds.length < 6) {
          const randomId = Math.floor(Math.random() * pokemonCount);
          if (!randomIds.includes(randomId)) {
              randomIds.push(randomId);
          }
      }
        // Get IDs by splitting url
      const pokemonIds = randomIds.map(index => data.pokemon[index].pokemon.url.split("/")[6]);
      // Get data by calling previous funct for all random id's
      const pokemonData = await Promise.all(pokemonIds.map(id => getPokemonDataForId(id)));
      return pokemonData;
}

const displayPokemonSprites = (pokemonData) => {
  const slots = document.querySelectorAll('.slot');
  slots.forEach((slot, index) => {
      slot.innerHTML = '';
      const pokemonIndex = index % pokemonData.length;
      const spriteUrl = pokemonData[pokemonIndex].sprites.front_default;
      if (spriteUrl) {
          const img = document.createElement('img');
          img.src = spriteUrl;
          img.alt = pokemonData[index].name; 


          img.style.top = '-100%'; // Initially position the image above the slot
          slot.appendChild(img);
          // Trigger reflow to apply initial style before transitioning
          void img.offsetWidth;
          // Transition the image into view
          img.style.transition = 'top 1s ease-in-out';
          img.style.top = '0';
      }
  });
}
//adjust to get rid of simulated practice promise
function submitForm(answer,pokeType) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let shouldError = answer.toLowerCase() !== pokeType
      if (shouldError) {
        console.log(pokeType)
        reject(new Error('Oof'));
      } else {
        resolve();
      }
    }, 1500);
  });

}



export default App
