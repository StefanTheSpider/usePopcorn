import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import StarRating from './starrating';

// function Test() {
//     const [movieRating, setMovieRating] = useState(0);
//     return (
//         <div>
//             <StarRating maxRating={5} onSetRating={setMovieRating} />
//             <p>has {movieRating} stars</p>
//         </div>
//     );
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />

        {/* <StarRating
            maxRating={10}
            className={'className'}
            messages={['bad', 'ok', 'good', 'super', 'exelent']}
            defaultRating={0}
        /> */}

        {/* <Test /> */}
    </React.StrictMode>
);
