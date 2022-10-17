import { Injectable } from '@nestjs/common';
import { HiddenWord } from '../../rooms/helpers/rooms.events';
import { words } from '../helpers/words';

@Injectable()
export class WordsService {
  private readonly shownCharacters: string[] = [' ', '-', '_', '&']; //TODO

  /**
   *
   * @param customList list of probable formatted words to choose from
   * with at least one item. If not provided, app's default word
   * list will be used.
   */
  getRandomWord(customList?: string[]): {
    word: string;
    hiddenWord: HiddenWord;
  } {
    const listToChooseFrom: string[] = customList || words;
    const randomIndex: number = Math.floor(
      Math.random() * listToChooseFrom.length,
    );
    const word: string = listToChooseFrom[randomIndex];

    const formattedWord: string = customList ? word : WordsService.format(word);

    const hiddenWord: HiddenWord = word
      .split('')
      .map((char) => (this.shownCharacters.includes(char) ? char : null));

    return { word: formattedWord, hiddenWord: hiddenWord };
  }

  public static format(word: string): string {
    return word.replace('%20', ' ').toUpperCase();
  }

  /**
   *
   * @param word formatted word
   * @param wordList formatted word list
   */
  matchesWordList(word, wordList: string[]): boolean {
    return wordList.includes(word);
  }

  /**
   *
   * @param word
   * @param hiddenWord current state of revealed characters
   * @returns HiddenWord - new state of revealed characters with extra hint
   */
  getHint(word: string, hiddenWord: HiddenWord): HiddenWord {
    const hiddenIndexes: number[] = hiddenWord
      .map((val, index) => (!val ? index : null))
      .filter((v) => v !== null);

    const randomIndexToReveal: number =
      hiddenIndexes[Math.floor(Math.random() * hiddenIndexes.length)];

    hiddenWord[randomIndexToReveal] = word[randomIndexToReveal];
    return hiddenWord;
  }

  /**
   * @returns string random string suffix of 4-5 numbers
   */
  static getRandomSuffix(): string {
    return (Math.floor(Math.random() * 10000) + 1000).toString();
  }
}
