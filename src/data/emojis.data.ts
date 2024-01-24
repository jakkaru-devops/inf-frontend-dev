import { IEmoji, IEmojiGroup } from 'components/complex/Messenger/interfaces';
import DATA_BY_EMOJI from './data-by-emoji.json';
import EMOJIS_BY_GROUPS from './emojis-by-groups.json';

export const EMOJIS_OBJ = DATA_BY_EMOJI as any as {
  [key: string]: IEmoji;
};
export const ALL_EMOJIS = Object.keys(EMOJIS_OBJ)
  .map(key => ({
    ...EMOJIS_OBJ[key],
    emoji: key,
  }))
  .filter(emoji => !emoji?.hidden && !!emoji?.html_code);
export const EMOJIS_CODES = ALL_EMOJIS.map(emoji => emoji?.html_code).filter(
  Boolean,
);
export const EMOJI_GROUPS: IEmojiGroup[] = (
  EMOJIS_BY_GROUPS as { label: string; name: string; list: string[] }[]
)
  .map(group => ({
    ...group,
    list: group.list
      .map(emojiKey => ({
        ...EMOJIS_OBJ[emojiKey],
        emoji: emojiKey,
      }))
      .filter(emoji => !emoji?.hidden && !!emoji?.html_code),
  }))
  .filter(group => !!group?.list?.length);
