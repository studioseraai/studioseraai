import Shell from '../gallery-components/shell';
import JournalIndex from './JournalIndex';

export const metadata={
 title:'The Seraai Journal — Studio Seraai',
 description:'An editorial space for art, ideas, artists, materials and culture at Studio Seraai.'
};

export default function Page(){
 return <Shell><JournalIndex/></Shell>;
}
