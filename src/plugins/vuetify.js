import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { VTreeview } from 'vuetify/labs/VTreeview';

export default createVuetify({
    theme: {
        defaultTheme: 'light',
    },
    components: {
        ...components,
        VTreeview,
    },
    directives,
});
