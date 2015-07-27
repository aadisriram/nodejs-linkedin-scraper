function Language(name, proficiency) {
	this.name = name;
	this.proficiency = (function(prof){
		if (~prof.indexOf('elementary')) {
			return 'elementary';
		} else if (~prof.indexOf('native')) {
			return 'native_or_bilingual';
		} else if (~prof.indexOf('professional')) {
			if (~prof.indexOf('fulle'))
				return 'full_professional';
			else return 'professional_working';
		} else {
			return 'limited_working';
		}
	})(proficiency);
}

module.exports = Language;
