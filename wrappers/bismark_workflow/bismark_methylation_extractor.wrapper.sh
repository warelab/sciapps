INPUT=${input}
OVERLAP=${overlap}
COMPREHENSIVE=${comprehensive}
IG_R1_5=${ig_r1_5}
IG_R2_5=${ig_r2_5}
IG_R1_3=${ig_r1_3}
IG_R2_3=${ig_r2_3}
BEDGRAPH=${bedGraph}
CUTOFF=${cutoff}
CYTOSINE=${cytosine}
CX=${cx}
GENOME=${genome_dir}

if [ "$INPUT" ] && [ -d "$INPUT" ]
then
	INPUT=$INPUT/$(ls $INPUT)
fi


ARGS="--no_header --multicore 4 $INPUT"

if [ "${type}" ] && [ "${type}" == "single end" ]
then 
	ARGS="--single-end ${ARGS}"
else 
	ARGS="--paired-end ${ARGS}"
	if [ "${OVERLAP}" == "1" ]; then ARGS="--include_overlap ${ARGS}"; fi
fi

if [ -n "${IG_R1_5}" ] && [ ${IG_R1_5} -gt 0 ]; then ARGS="--ignore ${ARGS}"; fi 
if [ -n "${IG_R2_5}" ] && [ ${IG_R2_5} -gt 0 ]; then ARGS="--ignore_r2 ${ARGS}"; fi 
if [ -n "${IG_R1_3}" ] && [ ${IG_R1_3} -gt 0 ]; then ARGS="--ignore_3prime ${ARGS}"; fi 
if [ -n "${IG_R2_3}" ] && [ ${IG_R2_3} -gt 0 ]; then ARGS="--ignore_3prime_r2 ${ARGS}"; fi 
#if [ "${COMPREHENSIVE}" == "1" ]; then ARGS="--comprehensive ${ARGS}"; fi
#if [ "${BEDGRAPH}" == "1" -o "${CYTOSINE}" == "1" ]
#then 
#	ARGS="--bedGraph --remove_spaces ${ARGS}"
#	if [ -n "${CUTOFF}" ] && [ ${CUTOFF} -gt 1 ]; then ARGS="--cutoff ${CUTOFF} ${ARGS}"; fi
#fi
#if [ "${CX}" == "1" ]; then ARGS="--CX ${ARGS}"; fi
#if [ "$GENOME" ] && [ -f "$GENOME" ]
#then
#	TMP_GENOME_DIR=$(tar -tzf "$GENOME" | head -1)
#	tar -xzvf "$GENOME" 
#	rm -rf "$GENOME"
#	mv "$TMP_GENOME_DIR" "$GENOME"
#fi
#if [ "${CYTOSINE}" == "1" ]; then ARGS="--cytosine_report --genome_folder ${GENOME} ${ARGS}"; fi

echo bismark_methylation_extractor ${ARGS}
singularity exec -B /scratch:/scratch /scratch/tacc/images/bismark_0.18.1--pl5.22.0_0.img bismark_methylation_extractor ${ARGS}

#echo 'use strict;use File::Copy;my $op=shift;chomp(@ARGV=<STDIN>) unless @ARGV;for (@ARGV) {my $was=$_;eval $op;die $@ if $@; move($was,$_) unless $was eq $_;}1;' > ReName.pl

for c in CpG CHG CHH
do
	for s in OT OB CTOT CTOB
	do
		output=bismark_methylation_extractor_output.${c}_${s}.txt
		mkdir -p $output
		mv ${c}_${s}_*.txt $output
	done
done

#perl ReName.pl 's/^bismark_output/bismark_methylation_extractor_output/' bismark_output.*
#perl ReName.pl 's/(.*)_bismark_output/bismark_methylation_extractor_output.\1/' *_bismark_output.*

# Now, delete the bin/ directory
rm -rf ${input}
#if [ "${GENOME}" ]; then rm -rf ${GENOME}; fi
#rm -rf *.spaces_removed.txt
#rm -rf ReName.pl
rm -rf bin app.json job.json test.sh test.tgz wrapper.sh *.ipcexe
