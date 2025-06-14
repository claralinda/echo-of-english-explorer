
import { useState } from "react";

type Props = {
  words: {
    id: string;
    text: string;
    definition: string;
    examples: string[];
    createdAt: string;
  }[];
};

/** Lowercase first letter utility */
const lcFirst = (str: string) =>
  str ? str.charAt(0).toLowerCase() + str.slice(1) : str;

const WordList = ({ words }: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (words.length === 0) {
    return (
      <div className="py-12 text-muted-foreground text-lg text-center">
        No words or sayings saved yet.
      </div>
    );
  }

  return (
    <ul className="w-full bg-white min-h-screen"> {/* Full white background */}
      {words.map((w, idx) => (
        <li
          key={w.id}
          className={`border-b border-[#eee] last:border-b-0 px-4 ${
            idx === 0 ? "pt-4" : "pt-2"
          } pb-2`}
        >
          <button
            type="button"
            className="flex flex-col w-full text-left focus:outline-none focus:bg-gray-50 "
            onClick={() => setOpenId(openId === w.id ? null : w.id)}
            aria-expanded={openId === w.id}
            data-testid="word-collapsible"
          >
            <span className="font-medium text-[1.13rem] leading-tight text-gray-900">
              {w.text}
            </span>
            <span className="text-sm mt-0.5 text-gray-400 font-normal leading-snug">
              {lcFirst(w.definition)}
            </span>
            {w.examples.length > 0 && openId === w.id ? (
              <ul className="mt-1 ml-1 pl-2 border-l-2 border-gray-100 text-xs text-gray-400">
                {w.examples.map((ex, i) => (
                  <li key={i} className="pb-1 last:pb-0">
                    {ex}
                  </li>
                ))}
              </ul>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default WordList;
