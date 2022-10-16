import { Injectable } from '@nestjs/common';
import { HiddenWord } from '../../rooms/helpers/rooms.events';
import { words } from '../helpers/words';

@Injectable()
export class WordsService {
  private readonly shownCharacters: string[] = [' ', '-', '_', '&']; //TODO

  getRandomWord(customList?: string[]): {
    word: string;
    hiddenWord: HiddenWord;
  } {
    const listToChooseFrom: string[] = customList || words;
    const randomIndex: number = Math.floor(
      Math.random() * listToChooseFrom.length,
    );
    const word: string = listToChooseFrom[randomIndex].toUpperCase();

    const hiddenWord: HiddenWord = word
      .split('')
      .map((char) => (this.shownCharacters.includes(char) ? char : null));

    return { word: word, hiddenWord: hiddenWord };
  }

  getHint(word: string, hiddenWord: HiddenWord): HiddenWord {
    const hiddenIndexes: number[] = hiddenWord
      .map((val, index) => (!val ? index : null))
      .filter((v) => v !== null);

    const randomIndexToReveal: number =
      hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];

    hiddenWord[randomIndexToReveal] = word[randomIndexToReveal];
    return hiddenWord;
  }

  static getRandomSuffix(): string {
    return (Math.floor(Math.random() * 10000) + 1000).toString();
  }

  /**
   *
   * @param guess
   * @param wordToGuess word generated by this service
   */
  matches(guess, wordToGuess): { formattedGuess: string; matches: boolean } {
    const formattedGuess: string = guess.replace('%20', ' ').toUpperCase();
    return {
      formattedGuess: formattedGuess,
      matches: formattedGuess === wordToGuess,
    };
  }
}
