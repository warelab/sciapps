'use strict';

import React from 'react';

const Visual=React.createClass({
    render: function() {
        return(
            <iframe src="http://brie.cshl.edu/shiny/ballgown/" frameborder="0" width="100%" height="100%"></iframe>
        )
    }
});

module.exports = Visual;
