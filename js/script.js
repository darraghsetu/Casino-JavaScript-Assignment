
// 1. Classes

class Card{
	#value;
	#suit;
	#src;
	#string;
	#values = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace"];
	#suits = [["H", "Hearts"], ["D", "Diamonds"], ["C", "Clubs"], ["S", "Spades"]];
	#width = 120;
	#height = 168;
	
	constructor( str ){
		if( str ){
			this.#value = parseInt( str );
			this.#suit = str.charAt( str.length - 1 ).toUpperCase( );
			this.#src = `images/cards/${this.#value + this.#suit}.svg`;
			
			this.#string = `${this.#values[this.#value - 2]} of `;
			this.#suits.forEach( suit => this.#string += suit[0] === this.#suit ? suit[1] : "" );
		} else{
			this.#value = 0;
			this.#suit = "";
			this.#src = `images/cards/back.svg`;
			this.#string = "Card Back";
		}
	}
	
	get value( ){
		return this.#value;
	}
	
	get suit( ){
		return this.#suit;
	}
	
	get src( ){
		return this.#src;
	}
	
	set value( value ){
		if( value > 0 && value < 15 ){
			this.#value = value;
		}
	}
	
	asHTMLTag( size ){
		let tag;
		let width;
		let height;
		
		if( size !== undefined ){
			size = size.toLowerCase( );
		}
		
		switch( size ){
			case "small":
				width = this.#width / 2;
				height = this.#height / 2;				
				break;
			case "large":
				width = this.#width * 2;
				height = this.#height * 2;				
				break;
			default:
				width = this.#width;
				height = this.#height;
		}
		
		tag = document.createElement( "img" );
		tag.width = width;
		tag.height = height;
		tag.src = this.#src;
		tag.alt = this.#string;
		
		return tag;
	}
	
	asDoubleSidedHTMLTag( size ){
		let tag;
		let width;
		let height;
		
		if( size !== undefined ){
			size = size.toLowerCase( );
		}
		
		switch( size ){
			case "small":
				width = this.#width / 2;
				height = this.#height / 2;				
				break;
			case "large":
				width = this.#width * 2;
				height = this.#height * 2;				
				break;
			default:
				width = this.#width;
				height = this.#height;
		}
				
		let cardContainerDiv = document.createElement( "div" );
		cardContainerDiv.classList.add( "card-container" );
		cardContainerDiv.style.display = "inline-block";
		
		let cardDiv = document.createElement( "div" );
		cardDiv.classList.add( "card" );
		
		let faceDownDiv = document.createElement( "div" );
		faceDownDiv.classList.add( "face-down" );
		
		let faceUpDiv = document.createElement( "div" );
		faceUpDiv.classList.add( "face-up" );
		faceUpDiv.style.backgroundImage = `url(${this.#src})`;
		
		cardDiv.append( faceDownDiv );
		cardDiv.append( faceUpDiv );
		cardContainerDiv.append( cardDiv );
		
		return cardContainerDiv;
	}
	
	toString( ){
		return this.#string;
	}
}

class Deck{
	#deck;
	#remainingCards;
	#suits = ["H", "D", "C", "S"];

	constructor( shuffle = true ){
		this.newDeck( );
		if( shuffle ){
			this.shuffleDeck( );
		}
	}
	
	newDeck( ){
		this.#deck = [];
		
		for( let j = 1; j <= 4; j++ ){
			for( let i = 2; i <= 14; i++ ){
				this.#deck.push( new Card( i + this.#suits[j - 1] ) );
			}
		}

		this.#remainingCards = this.#deck.length;
	}
	
	shuffleDeck( ){
		this.#deck = this.#knuth_shuffle( this.#deck );
	}

	// Not original work
	// Credit: Donald E. Knuth, The Art of Programming Vol. 2, 2nd Edition, p. 139
	// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
	#knuth_shuffle( array ){
		let n = array.length;
		let randomIndex;
		
		while( n > 1 ){
			randomIndex = Math.floor(n * Math.random());
			n--;
			[array[n], array[randomIndex]] = [array[randomIndex], array[n]];
		}
		
		return array;
	}

	isEmpty( ){
		return this.#remainingCards === 0;
	}
	
	blankCard( ){
		return new Card( );
	}
	
	nextCard( ){
		let card;
		
		if( this.isEmpty( ) ){
			card = this.blankCard( );
		} else{
			this.#remainingCards--;
			card = this.#deck.shift( );	
		}
		
		return card;
	}
	
	asHTMLTags( size ){
		let tags = [];
		this.#deck.forEach( card => tags.push( card.asHTMLTag( size ) ) );
		return tags;
	}
	
	toBlackjack( ){
		this.#deck.forEach( card => {
			if( card.value === 11 || card.value === 12 || card.value === 13 ){
				card.value = 10;
			} else if( card.value === 14 ){
				card.value = 11;
			}
		});
	}
	
	toString( ){
		let deckString = "";
		this.#deck.forEach( card => { deckString += card + "<br>" });
		return deckString;
	}
}

class Player{
	#name;
	#balance;
	
	constructor( name ){
		this.#name = name;
		this.#balance = 500;
	}
	
	get name( ){
		return this.#name;
	}
	
	get balance( ){
		return this.#balance;
	}
	
	updateBalance( change ){
		let playerBalance = document.querySelector( "#player-balance" );
		this.#balance += change;
		playerBalance.textContent = addCommas( this.#balance );
		updateBettingBtns( );
	}
	
	toString( ){
		return "Player " + this.#name + " has " + this.#balance + " chips";
	}
}

// 2. Functions

const outputMainScreen = _ => {
	let welcomeScreen = document.querySelector( "#welcome-screen" );
	let nav = document.querySelector( "#nav" );
	let board = document.querySelector( "#board" );
	let player = document.querySelector( "#player" );
	let audio = document.querySelector( "audio" );
	
	welcomeScreen.remove( );
	
	let template = Handlebars.compile( document.querySelector( '#navbar-template' ).innerHTML );
	let compiled = template( navbarData );
	document.querySelector( '#nav' ).innerHTML = compiled;
	addNavLinksListeners( );
	addButtonsListeners( );
	
	nav.classList.remove( "hidden" );
	board.classList.remove( "hidden" );
	player.classList.remove( "hidden" );
	audio.volume = 0.5;
	audio.play( );
	
	bounty.default({ el: ".js-bounty", value: "40,000,000" });
}

const outputHCScreen = _ => {
	
	clearBoard( );

	let template = Handlebars.compile( document.querySelector( "#game-template" ).innerHTML );
	let compiled = template( gamesData[0] );
	document.querySelector( "#board" ).innerHTML = compiled;
	
	let dealerHand = document.querySelector( "#dealer-hand" );
	dealerHand.append( deck.blankCard( ).asDoubleSidedHTMLTag( ) );
	
	let playerHand = document.querySelector( "#player-hand" );
	playerHand.append( deck.blankCard( ).asDoubleSidedHTMLTag( ) );
	
	let howToPlayBtn = document.querySelector( "#how-to-play" );
	
	howToPlayBtn.addEventListener( "click", e => {
		outputHCHowToScreen( );
	});
}

const outputHCHowToScreen = _ => {
	
	clearBoard( );
	disableBettingBtns( );
	
	let template = Handlebars.compile( document.querySelector( '#how-to-template' ).innerHTML );
	let compiled = template( howToData[0] );
	document.querySelector( '#board' ).innerHTML = compiled;
	
	let shownCards = document.querySelector( '#shown-cards' );
	
	for( let i = 14; i > 10; i-- ){
		let card = new Card( i + "H" ).asHTMLTag( );
		let br = document.createElement( "br" );
		shownCards.append( card );
		shownCards.append( br );
	}
	
	let hiddenCards = document.querySelector( '#hidden-cards' );
	
	for( let i = 10; i > 1; i-- ){
		let card = new Card( i + "H" ).asHTMLTag( );
		let br = document.createElement( "br" );
		hiddenCards.append( card );
		hiddenCards.append( br );
	}

	let showHidden = document.querySelector( '#show-hidden' );

	showHidden.addEventListener( "click", e => { 
		hiddenCards.classList.toggle( "hidden" ); 
		showHidden.textContent = showHidden.textContent === "Show More" ? "Show Less" : "Show More";
	});
	
	let backBtn = document.querySelector( "#back" );
	
	backBtn.addEventListener( "click", e => {
		updateBettingBtns( );
		outputHCScreen( );
	});
	
	backBtn.addEventListener( "mouseenter", e => {
		backBtn.style.color = "darkgrey";
	});
	
	backBtn.addEventListener( "mouseleave", e => {
		backBtn.style.color = "white";
	});
}

const outputHOLScreen = _ => {
	
	clearBoard( );
	
	let template = Handlebars.compile( document.querySelector( "#game-template" ).innerHTML );
	let compiled = template( gamesData[1] );
	document.querySelector( "#board" ).innerHTML = compiled;
	
	let dealerHand = document.querySelector( "#dealer-hand" );
	dealerHand.append( deck.blankCard( ).asDoubleSidedHTMLTag( ) );
	
	let playerHand = document.querySelector( "#player-hand" );
	playerHand.append( deck.blankCard( ).asDoubleSidedHTMLTag( ) );
	
	let howToPlayBtn = document.querySelector( "#how-to-play" );
	
	howToPlayBtn.addEventListener( "click", e => {
		outputHOLHowToScreen( );
	});
}

const outputHOLHowToScreen = _ => {
	
	clearBoard( );
	disableBettingBtns( );
	
	let template = Handlebars.compile( document.querySelector( '#how-to-template' ).innerHTML );
	let compiled = template( howToData[1] );
	document.querySelector( '#board' ).innerHTML = compiled;
	
	let shownCards = document.querySelector( '#shown-cards' );
	
	for( let i = 14; i > 10; i-- ){
		let card = new Card( i + "H" ).asHTMLTag( );
		let br = document.createElement( "br" );
		shownCards.append( card );
		shownCards.append( br );
	}
	
	let hiddenCards = document.querySelector( '#hidden-cards' );
	
	for( let i = 10; i > 1; i-- ){
		let card = new Card( i + "H" ).asHTMLTag( );
		let br = document.createElement( "br" );
		hiddenCards.append( card );
		hiddenCards.append( br );
	}
	
	let showHidden = document.querySelector( '#show-hidden' );
	
	showHidden.addEventListener( "click", e => { 
		hiddenCards.classList.toggle( "hidden" ); 
		showHidden.textContent = showHidden.textContent === "Show More" ? "Show Less" : "Show More";
	});
	
	let backBtn = document.querySelector( "#back" );
	
	backBtn.addEventListener( "click", e => {
		updateBettingBtns( );
		outputHOLScreen( );
	});
	
	backBtn.addEventListener( "mouseenter", e => {
		backBtn.style.color = "darkgrey";
	});
	
	backBtn.addEventListener( "mouseleave", e => {
		backBtn.style.color = "white";
	});
}

const outputBJScreen = _ => {
	
	clearBoard( );
	
	let template = Handlebars.compile( document.querySelector( "#game-template" ).innerHTML );
	let compiled = template( gamesData[2] );
	document.querySelector( "#board" ).innerHTML = compiled;
	
	let dealerHand = document.querySelector( "#dealer-hand" );
	dealerHand.append( deck.blankCard( ).asDoubleSidedHTMLTag( ) );
	
	let playerHand = document.querySelector( "#player-hand" );
	playerHand.append( deck.blankCard( ).asDoubleSidedHTMLTag( ) );
	playerHand.append( deck.blankCard( ).asDoubleSidedHTMLTag( ) );
	
	let howToPlayBtn = document.querySelector( "#how-to-play" );
	
	howToPlayBtn.addEventListener( "click", e => {
		outputBJHowToScreen( );
	});
}

const outputBJHowToScreen = _ => {
	
	clearBoard( );
	disableBettingBtns( );
	
	let template = Handlebars.compile( document.querySelector( '#how-to-template' ).innerHTML );
	let compiled = template( howToData[2] );
	document.querySelector( '#board' ).innerHTML = compiled;
	
	let shownCards = document.querySelector( '#shown-cards' );
	
	let heading1 = document.createElement( "h3" );
	heading1.innerText = "11 or 1:";
	shownCards.append( heading1 );
	shownCards.append( new Card( "14H" ).asHTMLTag( ) ); 
	
	let heading2 = document.createElement( "h3" );
	heading2.innerText = "10:";
	shownCards.append( heading2 );
	
	for( let i = 13; i > 10; i-- ){
		let card = new Card( i + "H" ).asHTMLTag( );
		let br = document.createElement( "br" );
		shownCards.append( card );
		shownCards.append( br );
	}
	
	shownCards.append( document.createElement( "br" ) );
	
	let hiddenCards = document.querySelector( '#hidden-cards' );
	
	let heading3 = document.createElement( "h3" );
	heading3.innerText = "Face Value:";
	hiddenCards.append( heading3 );
	
	for( let i = 10; i > 1; i-- ){
		let card = new Card( i + "H" ).asHTMLTag( );
		let br = document.createElement( "br" );
		hiddenCards.append( card );
		hiddenCards.append( br );
	}
	
	let showHidden = document.querySelector( '#show-hidden' );
	
	showHidden.addEventListener( "click", e => { 
		
		hiddenCards.classList.toggle( "hidden" ); 
		showHidden.textContent = showHidden.textContent === "Show More" ? "Show Less" : "Show More";
	});
	
	let backBtn = document.querySelector( "#back" );
	
	backBtn.addEventListener( "click", e => {
		updateBettingBtns( );
		outputHOLScreen( );
	});
	
	backBtn.addEventListener( "mouseenter", e => {
		backBtn.style.color = "darkgrey";
	});
	
	backBtn.addEventListener( "mouseleave", e => {
		backBtn.style.color = "white";
	});
}

const outputFactorialScreen = _ => {
		
	clearBoard( );
	
	let container = document.createElement( "div" );
	container.id = "game";
	board.append( container );

	let title = document.createElement( "h1" );
	title.id = "title";
	title.textContent = "Something Unique";
	container.append( title );

	let messageBox = document.createElement( "div" );
	messageBox.id = "message-box";
	messageBox.classList.add( "ui", "segment" );
	container.append( messageBox );

	let message = document.createElement( "p" );
	message.id = "message";
	message.innerHTML = "Did you know there are 52! ways to rearrange a deck of cards?<br><br>Thats " + get52Factorial( ) + " total combinations (or thereabouts), wow!<br><br>That means if you shuffle a deck of cards, theres a <i>very</i> good chance you are the first person to have ever seen that exact combination.<br><br>Neat, huh? <b>Try it out!</b>";
	messageBox.append( message );

	let shuffleBtn = document.createElement( "button" );
	shuffleBtn.type = "button";
	shuffleBtn.id = "shuffled-deck";
	shuffleBtn.classList.add( "ui", "inverted", "button" );
	shuffleBtn.textContent = "Shuffle it up";
	container.append( shuffleBtn );

	let wholeDeck = document.createElement( "div" );
	wholeDeck.id = "dealer-hand";
	wholeDeck.classList.add( "ui", "column", "center", "aligned", "segment" );
	container.append( wholeDeck );

	let unshuffledDeck = new Deck( false );	
	
	while( ! unshuffledDeck.isEmpty( ) ){
		wholeDeck.append( unshuffledDeck.nextCard( ).asHTMLTag( "small" ) );
	}
	
	shuffleBtn.addEventListener( "click", e => {
		let shuffledDeck = new Deck( );
		wholeDeck.innerHTML = "";
		
		while( ! shuffledDeck.isEmpty( ) ){
			wholeDeck.append( shuffledDeck.nextCard( ).asHTMLTag( "small" ) );
		}
	});
}

const clearBoard = _ => {
	board.innerHTML = "";
}

const updateBettingBtns = _ => {
	let bettingBtns = document.querySelector( "#betting" ).querySelectorAll( "button" );
	
	bettingBtns.forEach( bettingBtn => { bettingBtn.disabled = true } );
	
	if( player.balance >= 100 ){
		bettingBtns[2].disabled = false;
		bettingBtns[3].disabled = false;
		
		if( player.balance >= 200 ){
			bettingBtns[1].disabled = false;
			
			if( player.balance >= 500 ){
				bettingBtns[0].disabled = false;
			}
		}
	}
	
	if( removeCommas( currentBet.textContent ) !== 0 ){
		bettingBtns[4].disabled = false;
		bettingBtns[5].disabled = false;
	}
}

const get52Factorial = _ => {
	let number = 80658175170943878571660636856403766975289505440883277824000000000000n;
	number = number.toString( );
	number = addCommas( number );

	let span = document.createElement( "span" );
	span.textContent = number;
	span.style.overflowWrap = "break-word";
	
	return span.outerHTML;
}

const getTodaysDate = _ => {
	return new Date( new Date( ).toLocaleDateString("en-CA", {year:"numeric", month: "2-digit", day:"2-digit"}) )
}

const isOnlyLetters = word => {
	let isOnlyLetters = true;
	
	for( const character of word ){
		let code = character.charCodeAt( 0 );
		
		// Checks if char not between A-Z && not between a-z 
		if( ! ( ( code >= 65 && code <= 90 ) || ( code >= 97 && code <= 122 ) ) ){
			isOnlyLetters = false;
		}
	}
	
	return isOnlyLetters;
}

const over18 = date => {
	
	// Todays date in YYYY-MM-DD (thanks Canada!), timestamp given to Date( ) again to set time to 00:00:00
	const today = getTodaysDate( );
	let todayInMS = today.getTime( );
	
	// 18 * (1 years + 1/4 leap day * 24 hours * 60 minutes * 60 seconds * 1000 miliseconds )
	let eighteenYearsInMS = 18 * (365.25 * 24 * 60 * 60 * 1000);
	
	const eighteenYearsAgoInMS = todayInMS - eighteenYearsInMS;
	
	// Submitted date will be YYYY-MM-DD 00:00:00
	let dateInMS = date.getTime( );
	
	// Date before epoch or date before or equal to eighteen years ago
	if( dateInMS < 0 || dateInMS <= eighteenYearsAgoInMS ){
		return true;
	} else{
		return false;
	}
}

const updateCurrentBet = change => {
	let bet = removeCommas( currentBet.textContent );
	bet += change;
	currentBet.textContent = addCommas( bet );
	
	updateBettingBtns( );
}

const addCommas = number => {
	let segments = [];
	number = number.toString( );
	
	// Converts "9876543210" to [ "210", "543", "876", "9" ]	
	while( number.length !== 0 ){
		if( number.length <= 3 ){
			segments.push( number );
			number = "";
		} else{
			segments.push( number.substring( number.length - 3 ) );
			number = number.substring( 0, number.length - 3 ); 
		}
	}
	
	// Reverses [ "210", "543", "876", "9" ] (segments) and 
	// concatenates  each segment to a string delimited by commas, i.e. "9,876,543,210"
	segments.reverse( );
	let numberString = "";
	segments.forEach( num => numberString += num + "," );
	numberString = numberString.slice(0, numberString.length - 1); // Removes extraneous comma
	
	return numberString;
}

const removeCommas = numberString => {
	let number = "";
	let segments = numberString.split( "," );
	segments.forEach( threeDigits => number += threeDigits );
	number = Number( number );
	return number;
}

const newPlayBtn = _ => {
	let playBtn = document.querySelector("#play-button");
	let playBtnCopy = playBtn.cloneNode( );
	playBtnCopy.textContent = "Play";
	playBtn.parentNode.replaceChild( playBtnCopy, playBtn );
}

const disableBettingBtns = _ => {
	bettingBtns = document.querySelector( "#betting" ).querySelectorAll( "button" );
	bettingBtns.forEach( bettingBtn => { bettingBtn.disabled = true } );	
}

const playHighCard = _ => {
	let delay = 0;
	
	let faceUpCards = document.querySelectorAll( ".flip" );
	for( card of faceUpCards ){
		card.classList.add( "unflip" );
		delay = 625;
	}
	
	let bet = removeCommas( currentBet.textContent );
	currentBet.textContent = "0";
	let winnings = 0;
	
	setTimeout( _ => {
		let message = document.querySelector( "#message" );
		message.textContent = "Flipping cards in 3";
		
		setTimeout( _ => { message.textContent = "Flipping cards in 2" }, 1000 );
		setTimeout( _ => { message.textContent = "Flipping cards in 1" }, 2000 );
		
		if( deck.remainingCards < 2 ){
			deck.newDeck( );
		}		
		
		setTimeout( _ => {
			let dealerHand = document.querySelector( "#dealer-hand" );
			let dealerCard = deck.nextCard( );
			dealerHand.innerHTML = "";
			dealerHand.append( dealerCard.asDoubleSidedHTMLTag( ) );
			dealerHand.querySelector( ":scope .card" ).classList.add( "flip" );
			
			let playerHand = document.querySelector( "#player-hand" );
			let playerCard = deck.nextCard( );
			playerHand.innerHTML = "";
			playerHand.append( playerCard.asDoubleSidedHTMLTag( ) );
			playerHand.querySelector( ":scope .card" ).classList.add( "flip" );
			
			setTimeout( _ => {
				if( dealerCard.value > playerCard.value ){
					message.textContent = "You lose.";
					
					if( document.querySelector( "#player-balance" ).textContent === "0" ){
						document.querySelector( "#refill-button" ).classList.toggle( "hidden" );
					}
					
				} else if( playerCard.value > dealerCard.value ){
					winnings = bet * 2;
					message.textContent = "You win " + addCommas( winnings ) + "!";
				} else{
					winnings = bet;
					message.textContent = "No winner. Bet returned.";
				}
				
				player.updateBalance( winnings );
			}, 625 );
		}, 3000 );
	}, delay );
}

const playHigherOrLower = _ => {
	let delay = 0;
	
	let faceUpCards = document.querySelectorAll( ".flip" );
	for( card of faceUpCards ){
		card.classList.add( "unflip" );
		delay = 625;
	}
	
	let bet = removeCommas( currentBet.textContent );
	currentBet.textContent = "0";
	let winnings = 0;
	
	if( deck.remainingCards < 2 ){
		deck.newDeck( );
	}
	
	setTimeout( _ => {
		let dealerHand = document.querySelector( "#dealer-hand" );
		let dealerCard = deck.nextCard( );
		dealerHand.innerHTML = "";
		dealerHand.append( dealerCard.asDoubleSidedHTMLTag( ) );

		let playerHand = document.querySelector( "#player-hand" );
		let playerCard = deck.nextCard( );
		playerHand.innerHTML = "";
		playerHand.append( playerCard.asDoubleSidedHTMLTag( ) );
		playerHand.querySelector( ":scope .card" ).classList.add( "flip" );
		
		setTimeout( _ => {
			let message = document.querySelector( "#message" );
			message.textContent = "Is your card higher or lower than the dealer's card?";
			
			// Had to remake the buttons each time or else
			// every game would add an additional event listener on
			let higherBtn = document.querySelector( "#higher-button" );
			let higherBtnCopy = higherBtn.cloneNode( );
			higherBtnCopy.textContent = "Higher";
			higherBtn.parentNode.replaceChild( higherBtnCopy, higherBtn );
			higherBtnCopy.disabled = false;
			
			let lowerBtn = document.querySelector( "#lower-button" );
			let lowerBtnCopy = lowerBtn.cloneNode( );
			lowerBtnCopy.textContent = "Lower";
			lowerBtn.parentNode.replaceChild( lowerBtnCopy, lowerBtn );
			lowerBtnCopy.disabled = false;
			
			higherBtnCopy.addEventListener( "click", e => {
				higherBtnCopy.disabled = true;
				lowerBtnCopy.disabled = true;
				message.textContent = "Flipping cards in 3";
				
				setTimeout( _ => { message.textContent = "Flipping cards in 2" }, 1000 );
				setTimeout( _ => { message.textContent = "Flipping cards in 1" }, 2000 );
				
				setTimeout( _ => {
					dealerHand.querySelector( ":scope .card" ).classList.add( "flip" );
					
					setTimeout( _ => {
						if( dealerCard.value > playerCard.value ){
							message.textContent = "You lose.";
							
							if( document.querySelector( "#player-balance" ).textContent === "0" ){
								document.querySelector( "#refill-button" ).classList.toggle( "hidden" );
							}
						
						} else if( dealerCard.value < playerCard.value ){
							winnings = bet * 2;
							message.textContent = "You win " + addCommas( winnings ) + "!";
						} else{
							winnings = bet;
							message.textContent = "No winner. Bet returned.";
						}
						
						player.updateBalance( winnings );
					}, 625 );
				}, 3000 );
			});
			
			lowerBtnCopy.addEventListener( "click", e => {
				higherBtnCopy.disabled = true;
				lowerBtnCopy.disabled = true;
				message.textContent = "Flipping cards in 3";
				
				setTimeout( _ => { message.textContent = "Flipping cards in 2" }, 1000 );
				setTimeout( _ => { message.textContent = "Flipping cards in 1" }, 2000 );
				
				setTimeout( _ => {
					dealerHand.querySelector( ":scope .card" ).classList.add( "flip" );
					
					setTimeout( _ => {
						if( dealerCard.value < playerCard.value ){
							message.textContent = "You lose.";
							
							if( document.querySelector( "#player-balance" ).textContent === "0" ){
								document.querySelector( "#refill-button" ).classList.toggle( "hidden" );
							}
							
						} else if( dealerCard.value > playerCard.value ){
							winnings = bet * 2;
							message.textContent = "You win " + addCommas( winnings ) + "!";
						} else{
							winnings = bet;
							message.textContent = "No winner. Bet returned.";
						}
						
						player.updateBalance( winnings );
					}, 625 );
				}, 3000 );
			});
		}, 625 );
	}, delay );
}

const playBlackjack = _ => {
	deck = new Deck( );
	deck.toBlackjack( );
	let playerHand = [];
	let dealerHand = [];
	let playerTotal = 0;
	let dealerTotal = 0;
	let messageBox = document.querySelector( "#message-box" );
	let dealerMax = 0;
	let playerMax = 0;
	let result = "";
	let playerDone = false;
	let hitButton = document.querySelector( "#hit-button" );
	let stickButton = document.querySelector( "#stick-button" );
	let doubleButton = document.querySelector( "#double-button" );
	let winnings = 0;
	let delay = 0;
	
	let bet = removeCommas( currentBet.textContent );
	currentBet.textContent = "0";
	
	const nextCard = hand => {
		let card = deck.nextCard( );
		hand.push( card );
		updateHands( );
	}
	
	const updateHands = _ => {
		updateTotals( );
		updateMessageBox( );
		
		let dealerCards = document.querySelector( "#dealer-hand" ).children;
		let playerCards = document.querySelector( "#player-hand" ).children;
		let newCard = null;
		
		if( dealerCards.length < dealerHand.length ){
			newCard = dealerHand[dealerHand.length - 1].asDoubleSidedHTMLTag( );
			newCard.querySelector( ":scope .card" ).classList.add( "flip" );
			document.querySelector( "#dealer-hand" ).append( newCard );
		}
		
		if( playerCards.length < playerHand.length ){
			newCard = playerHand[playerHand.length - 1].asDoubleSidedHTMLTag( );
			newCard.querySelector( ":scope .card" ).classList.add( "flip" );
			document.querySelector( "#player-hand" ).append( newCard );
		}
	}
	
	const updateTotals = _ => {
		playerTotal = calcTotal( playerHand );
		dealerTotal = calcTotal( dealerHand );
	}
	
	const updateMessageBox = _ => {
		dealerString = `Dealer Total: ${totalAsString( dealerHand )} (Cards: ${outputHand( dealerHand )})`;
		playerString = `Player Total: ${totalAsString( playerHand )} (Cards: ${outputHand( playerHand )})`;
		
		dealerP = document.createElement( "p" );
		dealerP.innerText = dealerString;
		playerP = document.createElement( "p" );
		playerP.innerText = playerString;
		
		messageBox.innerHTML = "";
		messageBox.append( dealerP );
		messageBox.append( playerP );
	}
	
	const outputHand = hand => {
		let string = "";
		
		hand.forEach( card => {
			if( card.value === 11 ){
				string += "A "
			} else{
				string += card.value + " ";
			}
		});
		
		return string;
	}
	
	const calcTotal = hand => {
		let total = [0, 0];
		
		let aceCount = hand.filter( e => e.value === 11 ).length;
		
		if( aceCount > 0 ){
			total[0] += aceCount;
			total[1] += 11 + (aceCount - 1);
		}
		
		hand.forEach( card => {
			if( card.value !== 11 ){
				total[0] += card.value;
				
				if( aceCount !== 0 ){
					total[1] += card.value;
				}
			}
		});
		
		if( total[1] > 21 ){
			total[1] = 0;
		} else if( total[1] === 21 ){
			total[0] = 0;
		}
		
		return total;
	}
	
	const totalAsString = hand => {
		let total = calcTotal( hand );
		let string = "";

		if( total[0] !== 0 ){
			string += total[0];
			
			if( total[1] !== 0 ){
				string += " or " + total[1];
			}
		} else{
			string = total[1];
		}
		
		return string;
	}
	
	const getMaxes = _ => {
		dealerMax = dealerTotal[0] > dealerTotal[1] ? dealerTotal[0] : dealerTotal[1];
		playerMax = playerTotal[0] > playerTotal[1] ? playerTotal[0] : playerTotal[1];
	}
	
	const disableButtons = _ => {
		hitButton.disabled = true;
		stickButton.disabled = true;
		doubleButton.disabled = true;
	}
	
	const enableButtons = _ => {
		hitButton.disabled = false;
		stickButton.disabled = false;
		doubleButton.disabled = false;		
	}
	
	const eval = _ => {
		
		if( playerTotal[0] === 21 ){
			playerDone = true;
		}
		
		if( playerTotal[0] > 21 ){
			result = "Player has bust";
		} else if( playerDone ){
			nextCard( dealerHand );
			
			if( dealerTotal[1] === 21 ){
				result = "Dealer has blackjack";
			} else{
				while( dealerTotal[0] < 17 && ( dealerTotal[1] < 17 || dealerTotal[1] === 0 )  ){
					nextCard( dealerHand );
				}
				
				getMaxes( );
				
				if( dealerMax <= 21 ){
					if( dealerMax > playerMax ){
						result = "Dealer wins";
					} else if( playerMax > dealerMax ){
						winnings = bet * 2;
						result = `Player wins ${winnings} chips!`;
					} else{
						result = "Push";
						winnings = bet;
					}
				} else{
					winnings = bet * 2;
					result = `Dealer has bust, player wins ${winnings} chips!`;
				}
			}
		}
		
		if( result !== "" ){
			let resultP = document.createElement( "p" );
			resultP.innerText = result;
			messageBox.append( resultP );
			player.updateBalance( winnings );
			if( document.querySelector( "#player-balance" ).textContent === "0" ){
				document.querySelector( "#refill-button" ).classList.toggle( "hidden" );
			}
			disableButtons( );
		}
	}
	
	let hitButtonCopy = hitButton.cloneNode( );
	hitButtonCopy.textContent = "Hit";
	hitButton.parentNode.replaceChild( hitButtonCopy, hitButton );
	hitButton = document.querySelector( "#hit-button" );
	
	let stickButtonCopy = stickButton.cloneNode( );
	stickButtonCopy.textContent = "Stick";
	stickButton.parentNode.replaceChild( stickButtonCopy, stickButton );
	stickButton = document.querySelector( "#stick-button" );
	
	
	let doubleButtonCopy = doubleButton.cloneNode( );
	doubleButtonCopy.textContent = "Double";
	doubleButton.parentNode.replaceChild( doubleButtonCopy, doubleButton );
	doubleButtonCopy = document.querySelector( "#double-button" );
	
	enableButtons( );
	document.querySelector( "#dealer-hand" ).innerHTML = "";
	document.querySelector( "#player-hand" ).innerHTML = "";
	
	if( player.balance < bet ){
		doubleButton.disabled = true;
	}
	
	nextCard( dealerHand );
	nextCard( playerHand );
	nextCard( playerHand );
	
	if( playerTotal[1] === 21 ){
		nextCard( dealerHand );
		
		if( dealerTotal[1] === 21 ){
			result = "Push";
			winnings = bet;
		}else{
			winnings = 3 * bet;
			result = `Player wins ${winnings} chips!`;
		}
		
		let resultP = document.createElement( "p" );
		resultP.innerText = result;
		messageBox.append( resultP );
		player.updateBalance( winnings );
		if( document.querySelector( "#player-balance" ).textContent === "0" ){
			document.querySelector( "#refill-button" ).classList.toggle( "hidden" );
		}
		disableButtons( );
	}
	
	hitButton.addEventListener( "click", e => {
		nextCard( playerHand );
		doubleButton.disabled = true;
		eval( );
	});
	
	stickButton.addEventListener( "click", e => {
		disableButtons( );
		playerDone = true;
		eval( );
	});
	
	doubleButton.addEventListener( "click", e => {
		player.updateBalance( bet * -1 );
		bet *= 2;
		
		nextCard( playerHand );
		disableButtons( );
		playerDone = true;
		eval( );
	});
}

const addNavLinksListeners = _ => {
	
	let navLinks = document.querySelectorAll( "a" );
	
	// 52 Factorial Link
	navLinks[0].addEventListener( "click", e => {
		disableBettingBtns( );
		outputFactorialScreen( );
	});
	
	// High Card Link
	navLinks[1].addEventListener( "click", e => {
		e.preventDefault( );
		
		outputHCScreen( );
		updateBettingBtns( );
		newPlayBtn( );

		document.querySelector( "#play-button" ).addEventListener( "click", e => {
			disableBettingBtns( );
			playHighCard( );
		});
		
	});

	// Higher or Lower link
	navLinks[2].addEventListener( "click", e => {
		e.preventDefault( );
		
		outputHOLScreen( );
		updateBettingBtns( );
		newPlayBtn( );
		
		document.querySelector( "#play-button" ).addEventListener( "click", e => {
			disableBettingBtns( );
			playHigherOrLower( );
		});
	});
	
	// Blackjack Link
	navLinks[3].addEventListener( "click", e => {
		e.preventDefault( );
		
		outputBJScreen( );
		updateBettingBtns( );
		newPlayBtn( );
		
		document.querySelector( "#play-button" ).addEventListener( "click", e => {
			disableBettingBtns( );
			playBlackjack( );
		});
	});
}

const addButtonsListeners = _ => {

	// Music Button
	document.querySelector( "#music" ).addEventListener( "click", e => {
		let audio = document.querySelector( "audio" );
		
		if( audioPaused ){
			audio.play( );
			audioPaused = false;
			musicBtn.innerHTML = "<i class='pause icon'></i> Pause Music";
		} else{
			audio.pause( );
			audioPaused = true;
			musicBtn.innerHTML = "<i class='play icon'></i> Play Music";
		}
		
	});

	// Refill Button
	document.querySelector( "#refill-button" ).addEventListener( "click", e => {
		player.updateBalance( 500 );
		document.querySelector( "#refill-button" ).classList.toggle( "hidden" );
	});

	// 500 Bet Button
	document.querySelector( "#five-hundered" ).addEventListener( "click", e => {
		player.updateBalance( -500 );
		updateCurrentBet( 500 );
	});

	// 200 Bet Button
	document.querySelector( "#two-hundered" ).addEventListener( "click", e => {
		player.updateBalance( -200 );
		updateCurrentBet( 200 );
	});

	// 100 Bet Button
	document.querySelector( "#one-hundered" ).addEventListener( "click", e => {
		player.updateBalance( -100 );
		updateCurrentBet( 100 );
	});

	// Bet Max Button
	document.querySelector( "#bet-max" ).addEventListener( "click", e => {
		let bet = player.balance;
		player.updateBalance( bet * -1 );
		updateCurrentBet( bet );
	});

	// Reset Bet Button
	document.querySelector( "#reset-bet" ).addEventListener( "click", e => {
		let bet = removeCommas( currentBet.textContent );
		player.updateBalance( bet );
		updateCurrentBet( bet * -1 );
	});
}

// 3. Variables
let currentBet = document.querySelector( "#current-bet" );
let audioPaused = false;
let deck = new Deck( );
let player;

const gamesData = [ 
	{
		"title":"High Card"
	},
	{
		"title":"Higher or Lower",
		"buttonCount": "two",
		"buttons": [
			{
				"id": "higher",
				"text": "Higher"
			},
			{
				"id": "lower",
				"text": "Lower"
			}
		]
	},
	{
		"title":"Blackjack",
		"buttonCount": "three",
		"buttons": [
			{
				"id": "hit",
				"text": "Hit"
			},
			{
				"id": "stick",
				"text": "Stick"
			},
			{
				"id": "double",
				"text": "Double"
			}
		]
	}
];

const howToData = [
	{
		"title": "High Card",
		"id": "high-card",
		"steps": [ 	"The player and the dealer are each dealt one card",
					"The player places their bet",
					"Both cards are shown",
					"If they are the same, the bet is returned",
					"Otherwise the player with the higher value card wins" ],
		"odds": "1/1",
		"odds-example": "A winning bet of 100 chips returns 200 chips (Bet + Profit)"
	},
	{
		"title": "Higher or Lower",
		"id": "higher-or-lower",
		"steps": [	"The player and the dealer are each dealt one card",
					"The player places their bet",
					"The player views their card and guesses if their card's value is higher or lower than the dealer's card",
					"If they are the same, the bet is returned",
					"If the player guesses correctly they win, otherwise they lose" ],
		"odds": "1/1",
		"odds-example": "A winning bet of 100 chips returns 200 chips (Bet + Profit)"
	},
	{
		"title": "Blackjack",
		"id": "blackjack",
		"steps": [ 
			"The player is dealt two cards",
			"The dealer shows one card",
			"If the player has blackjack (Ace + 10), the dealer deals his next card",
			"If the dealer has blackjack it is a tie (push), otherwise the player wins",
			"If the player does not have blackjack they must hit, stick, or double down",
			"If the player chooses to hit, they receive another card and may choose again",
			"If the player chooses to double down, they double their bet and receive one card and it becomes the dealers turn",
			"If the player chooses to stick it becomes the dealer's turn",
			"If the dealer has blackjack they win",
			"If the dealer does not have blackjack, he dealer deals to himself until he reaches 17 or above",
			"If either the player's or dealer's cards total to above 21, they lose (bust)",
			"If neither player is bust the totals are compaired, the player with the higher total wins"
		],
		"odds": "2/1 for blackjack, 1/1 for all other wins",
		"odds-example": "A winning bet of 100 chips returns 200 chips (Bet + Profit), 300 for blackjack (Bet + (2 x Profit) )"
	}
];

const navbarData = {
	"headings": ["General", "Games"],
	"links": [ 
		{ "text":"52 Factorial", "link":"#" }
	],
	"games": ["High Card", "Higher or Lower", "Blackjack"]
	
};

// 4. Event Listeners

document.querySelector( "#welcome-submit" ).addEventListener( "click", e => {
		
	e.preventDefault( );
	
	let welcomeForm = document.querySelector( "form" );
	let playerName = document.querySelector( "#player-name" );
	let errorMessage = document.querySelector( "#welcome-error" );
	let formElements = welcomeForm.elements;
	let name = formElements["name"].value.trim( );
	let userDOB = new Date( formElements["dob"].value === "" ? getTodaysDate( ) : formElements["dob"].value );

	if( name.length !== 0 ){
		if( isOnlyLetters( name ) && over18( userDOB ) ){
			name = name.charAt( 0 ).toUpperCase( ) + name.substring( 1 ).toLowerCase( );
			player = new Player( name );
			playerName.textContent = player.name;
			outputMainScreen( );
		} else{
			formElements["name"].value = "";
			formElements["dob"].value = "";		
			errorMessage.textContent = over18( userDOB ) ? "No spaces, numbers or symbols allowed in name" : "You must be over 18 to enter"; 
			errorMessage.classList.remove( "hidden" );
		}
	}
});

