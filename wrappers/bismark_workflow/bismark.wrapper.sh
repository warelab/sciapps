INPUT1="${input1}"
INPUT2="${input2}"
GENOME="${genome_dir}"
MISMATCH=${mismatch}
LENGTH=${length}
MININS=${minins}
MAXINS=${maxins}
LIB_TYPE="${lib_type}"
QUAL="${qual}"

if [ "$GENOME" ] && [ -f "$GENOME" ]
then
	TMP_GENOME_DIR=$(tar -tzf "$GENOME" | head -1)
	tar -xzvf "$GENOME" 
	rm -rf "$GENOME"
	mv "$TMP_GENOME_DIR" "$GENOME"
fi

if [ "$INPUT1" ] && [ -d "$INPUT1" ]
then
	INPUT1=$INPUT1/$(ls $INPUT1)
fi

if [ "$INPUT2" ] && [ -d "$INPUT2" ]
then
	INPUT2=$INPU2/$(ls $INPUT2)
fi

ARGS="-p 4 --bowtie2 ${GENOME}"

if [ "${LIB_TYPE}" == "non directional" ]
then ARGS="--non_directional ${ARGS}"
elif [ "${LIB_TYPE}" == "pbat" ]
then ARGS="--pbat ${ARGS}"
fi

if [ -n "${MISMATCH}" ] && [ ${MISMATCH} -eq 0 -o ${MISMATCH} -eq 1 ]; then ARGS="-N ${MISMATCH} ${ARGS}"; fi
if [ -n "${LENGTH}" ] &&  [ ${LENGTH} -gt 3 -a ${LENGTH} -lt 32 ]
then ARGS="-L ${LENGTH} ${ARGS}"
fi
if [ -n "$QUAL" ] && [ "$QUAL" == "phred64" ]
then ARGS="--phred64-quals ${ARGS}"
else ARGS="--phred33-quals ${ARGS}"
fi

if [ -n "$INPUT2" ]
then
	if [ -n "$MININS" ] && [ $MININS -gt 0 ]; then ARGS="-I $MININS ${ARGS}"; fi
	if [ -n "$MAXINS" ] && [ $MAXINS -gt 0 ]; then ARGS="-X $MAXINS ${ARGS}"; fi
	ARGS="${ARGS} -1 ${INPUT1} -2 ${INPUT2}"
else
	ARGS="${ARGS} ${INPUT1}"
fi

echo bismark ${ARGS}
singularity exec -B /scratch:/scratch /scratch/tacc/images/bismark-2016-02-26-c138651612dd.img bismark ${ARGS}

INPUT1_F=$(basename $INPUT1)
mkdir bismark_output.txt; mv ${INPUT1_F}*_report.txt bismark_output.txt
mkdir bismark_output.bam; mv ${INPUT1_F}*.bam bismark_output.bam

# Now, delete the bin/ directory
rm -rf "$GENOME" "$INPUT1"
if [ -n "$INPUT2" ]; then rm -rf "$INPUT2"; fi
rm -rf bin app.json job.json test.sh test.tgz wrapper.sh *.ipcexe
